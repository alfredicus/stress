import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import {
    cloneMatrix3x3, Matrix3x3,
    newMatrix3x3Identity, transposeTensor
} from "../types"
import { SearchMethod } from "./SearchMethod"
import { MCMCSample } from "./MCMC"
import { computeStressAxesStats, StressAxesStats } from "./axisStats"

// Unit quaternion: [q0 (scalar), q1, q2, q3 (vector)]
type Quaternion = [number, number, number, number]

export type MCMCQuaternionParams = {
    nbIterations?: number
    burnIn?: number
    sigmaNoise?: number      // Angular measurement noise (radians). Temperature = 2·σ²
    sigmaRot?: number        // Rotation proposal width (radians)
    sigmaR?: number          // Stress ratio proposal width
    stressRatio?: number
    Rrot?: Matrix3x3
}

/**
 * MCMC search using a unit-quaternion internal state.
 *
 * Differences from MCMC (rotation-matrix version):
 *  1. State is stored as a unit quaternion q ∈ S³ — avoids rotation-matrix
 *     drift (det ≠ 1) that accumulates over long chains.
 *  2. Temperature is derived from the physical noise parameter:
 *     temperature = 2·σ_noise².  Default σ_noise = 10° gives T ≈ 0.061,
 *     matching the Gaussian likelihood model in the TeX document.
 *  3. Stress-ratio proposal uses reflection at 0 and 1 (correct for
 *     Metropolis–Hastings on a bounded interval) instead of clamping.
 *
 * The proposal kernel itself is geometrically identical to MCMC:
 *     q' = q ⊗ q_pert,   q_pert = (cos(φ/2), û·sin(φ/2))
 *     û ~ uniform on S²,  φ ~ N(0, σ_rot)
 * This is the same isotropic SO(3) perturbation as the axis-angle step used
 * in MCMC, expressed in quaternion form.
 *
 * @category Search-Method
 */
export class MCMCQuaternion extends SearchMethod {
    private nbIterations: number
    private burnIn: number
    private sigmaNoise: number   // radians
    private sigmaRot: number     // radians
    private sigmaR: number
    private stressRatio0: number
    private q0: Quaternion       // initial quaternion (from Rrot)
    private engine: Engine = new HomogeneousEngine()
    private chain: MCMCSample[] = []
    private acceptedCount: number = 0
    private bestFitWrot: Matrix3x3 | undefined

    constructor(
        {
            stressRatio = 0.5,
            nbIterations = 50000,
            burnIn = 0.2,
            sigmaNoise = Math.PI / 18,   // 10° default
            sigmaRot = 0.1,              // radians (~5.7°)
            sigmaR = 0.05,
            Rrot = newMatrix3x3Identity()
        }: MCMCQuaternionParams = {}
    ) {
        super()
        this.nbIterations = nbIterations
        this.burnIn = burnIn
        this.sigmaNoise = sigmaNoise
        this.sigmaRot = sigmaRot
        this.sigmaR = sigmaR
        this.stressRatio0 = stressRatio
        this.q0 = matrixToQuaternion(Rrot)
    }

    setOptions(json: any): void {
        if (json.nbIter !== undefined) this.nbIterations = json.nbIter
    }

    getEngine(): Engine { return this.engine }
    setEngine(engine: Engine): void { this.engine = engine }

    setInteractiveSolution({ rot, stressRatio }: { rot: Matrix3x3, stressRatio: number }): void {
        this.q0 = matrixToQuaternion(rot)
        this.stressRatio0 = stressRatio
    }

    getChain(): MCMCSample[] { return this.chain }

    getStats(): {
        acceptanceRate: number
        chainLength: number
        stressRatio: { mean: number, std: number, q05: number, q95: number }
        misfit: { mean: number, std: number, min: number }
        eulerAngles: {
            phi:   { mean: number, std: number, q05: number, q95: number }
            theta: { mean: number, std: number, q05: number, q95: number }
            psi:   { mean: number, std: number, q05: number, q95: number }
        }
        distributions: {
            stressRatio: number[]
            phi:   number[]
            theta: number[]
            psi:   number[]
        },
        axesStats?: StressAxesStats
    } | null {
        if (this.chain.length === 0) return null

        const ratios  = this.chain.map(s => s.stressRatio)
        const misfits = this.chain.map(s => s.misfit)

        const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
        const std  = (arr: number[], m: number) =>
            Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
        const quantile = (sorted: number[], q: number) => {
            const pos = q * (sorted.length - 1)
            const lo = Math.floor(pos)
            const hi = Math.ceil(pos)
            return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
        }

        const ratioMean   = mean(ratios)
        const sortedRatios = [...ratios].sort((a, b) => a - b)
        const misfitMean  = mean(misfits)

        // Extract Euler angles (ZXZ convention) from each stored Wrot.
        // Row permutation [0, 2, 1] matches eigenvector sort order (|σ| descending).
        const RAD2DEG = 180 / Math.PI
        const phiArr:   number[] = []
        const thetaArr: number[] = []
        const psiArr:   number[] = []

        for (const sample of this.chain) {
            const w = sample.Wrot
            const r = [w[0], w[2], w[1]]
            const theta = Math.acos(Math.max(-1, Math.min(1, r[2][2])))
            let phi: number, psi: number
            if (Math.abs(Math.sin(theta)) < 1e-6) {
                phi = 0
                psi = Math.atan2(-r[0][1], r[0][0])
            } else {
                phi = Math.atan2(r[0][2], -r[1][2])
                psi = Math.atan2(r[2][0], r[2][1])
            }
            phiArr.push(phi * RAD2DEG)
            thetaArr.push(theta * RAD2DEG)
            psiArr.push(psi * RAD2DEG)
        }

        const angleStats = (arr: number[]) => {
            const m = mean(arr)
            const s = std(arr, m)
            const sorted = [...arr].sort((a, b) => a - b)
            return { mean: m, std: s, q05: quantile(sorted, 0.05), q95: quantile(sorted, 0.95) }
        }

        return {
            acceptanceRate: (this.acceptedCount / this.nbIterations) * 100,
            chainLength: this.chain.length,
            stressRatio: {
                mean: ratioMean,
                std:  std(ratios, ratioMean),
                q05:  quantile(sortedRatios, 0.05),
                q95:  quantile(sortedRatios, 0.95)
            },
            misfit: {
                mean: misfitMean,
                std:  std(misfits, misfitMean),
                min:  Math.min(...misfits)
            },
            eulerAngles: {
                phi:   angleStats(phiArr),
                theta: angleStats(thetaArr),
                psi:   angleStats(psiArr)
            },
            distributions: {
                stressRatio: ratios,
                phi:   phiArr,
                theta: thetaArr,
                psi:   psiArr
            },
            axesStats: computeStressAxesStats(this.chain, this.bestFitWrot) ?? undefined
        }
    }

    private computeMisfit(dataset: Data[], Wrot: Matrix3x3, stressRatio: number): number {
        this.engine.setHypotheticalStress(Wrot, stressRatio)
        return dataset.reduce((cost, data) =>
            cost + data.cost({ stress: this.engine.stress(data.position) }) * data.weight
        , 0) / dataset.length
    }

    private gaussianRandom(): number {
        // Box-Muller transform
        const u1 = Math.random()
        const u2 = Math.random()
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    }

    run(dataset: Data[], misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
        const newSolution = cloneMisfitCriteriunSolution(misfitCriteriaSolution)
        this.chain = []
        this.acceptedCount = 0
        this.bestFitWrot = undefined

        const burnInCount = Math.floor(this.nbIterations * this.burnIn)

        // Temperature derived from noise model: T = 2·σ_noise²
        const temperature = 2 * this.sigmaNoise * this.sigmaNoise

        // Initialize state
        let q:              Quaternion = [...this.q0] as Quaternion
        let currentWrot:    Matrix3x3  = quaternionToMatrix(q)
        let currentR:       number     = this.stressRatio0
        let currentMisfit:  number     = this.computeMisfit(dataset, currentWrot, currentR)

        newSolution.misfit              = currentMisfit
        newSolution.rotationMatrixW     = cloneMatrix3x3(currentWrot)
        newSolution.stressRatio         = currentR
        newSolution.stressTensorSolution = this.engine.S()

        for (let i = 0; i < this.nbIterations; i++) {
            // --- Quaternion proposal: q' = q ⊗ q_pert ---
            // û ~ uniform on S²
            const phi_sph = Math.random() * 2 * Math.PI
            const cosTheta = 2 * Math.random() - 1
            const sinTheta = Math.sqrt(1 - cosTheta * cosTheta)
            const ux = sinTheta * Math.cos(phi_sph)
            const uy = sinTheta * Math.sin(phi_sph)
            const uz = cosTheta

            // φ ~ N(0, σ_rot)
            const phi = this.gaussianRandom() * this.sigmaRot
            const halfPhi = phi / 2
            const c = Math.cos(halfPhi)
            const s = Math.sin(halfPhi)

            const qPert: Quaternion = [c, ux * s, uy * s, uz * s]
            const qProp = quatMultiply(q, qPert)

            // --- Reflected Gaussian proposal for R on [0, 1] ---
            const Rprop = reflectBounded(currentR + this.gaussianRandom() * this.sigmaR, 0, 1)

            // --- Evaluate proposed state ---
            const proposedWrot = quaternionToMatrix(qProp)
            const proposedMisfit = this.computeMisfit(dataset, proposedWrot, Rprop)

            // --- Metropolis–Hastings acceptance ---
            // α = min(1, exp((M_current - M_proposed) / T))
            const logAlpha = (currentMisfit - proposedMisfit) / temperature
            if (Math.log(Math.random()) < logAlpha) {
                q             = qProp
                currentWrot   = proposedWrot
                currentR      = Rprop
                currentMisfit = proposedMisfit
                this.acceptedCount++
            }

            // Track best solution
            if (currentMisfit < newSolution.misfit) {
                newSolution.misfit               = currentMisfit
                newSolution.rotationMatrixW      = cloneMatrix3x3(currentWrot)
                newSolution.stressRatio          = currentR
                newSolution.stressTensorSolution = this.engine.S()
                this.bestFitWrot                 = cloneMatrix3x3(currentWrot)
            }

            // Store post-burn-in sample
            if (i >= burnInCount) {
                this.chain.push({
                    stressRatio: currentR,
                    Wrot:        cloneMatrix3x3(currentWrot),
                    misfit:      currentMisfit
                })
            }

            // Progress at 10% intervals
            const pct = (i / this.nbIterations) * 100
            if (pct % 10 === 0) this.sendMessage(`${pct}`)
        }

        return newSolution
    }
}

// ─── Quaternion helpers ────────────────────────────────────────────────────

/** Hamilton product: (q ⊗ p) */
function quatMultiply(q: Quaternion, p: Quaternion): Quaternion {
    const [q0, q1, q2, q3] = q
    const [p0, p1, p2, p3] = p
    const r: Quaternion = [
        q0*p0 - q1*p1 - q2*p2 - q3*p3,
        q0*p1 + q1*p0 + q2*p3 - q3*p2,
        q0*p2 - q1*p3 + q2*p0 + q3*p1,
        q0*p3 + q1*p2 - q2*p1 + q3*p0
    ]
    // Renormalize to stay on S³
    const n = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2] + r[3]*r[3])
    return [r[0]/n, r[1]/n, r[2]/n, r[3]/n]
}

/** Unit quaternion → rotation matrix (TeX appendix formula) */
function quaternionToMatrix(q: Quaternion): Matrix3x3 {
    const [q0, q1, q2, q3] = q
    return [
        [1 - 2*(q2*q2 + q3*q3),  2*(q1*q2 - q0*q3),      2*(q1*q3 + q0*q2)     ],
        [2*(q1*q2 + q0*q3),      1 - 2*(q1*q1 + q3*q3),  2*(q2*q3 - q0*q1)     ],
        [2*(q1*q3 - q0*q2),      2*(q2*q3 + q0*q1),      1 - 2*(q1*q1 + q2*q2) ]
    ]
}

/** Rotation matrix → unit quaternion (Shepperd's method) */
function matrixToQuaternion(R: Matrix3x3): Quaternion {
    const trace = R[0][0] + R[1][1] + R[2][2]
    let q: Quaternion

    if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1)
        q = [
            0.25 / s,
            (R[2][1] - R[1][2]) * s,
            (R[0][2] - R[2][0]) * s,
            (R[1][0] - R[0][1]) * s
        ]
    } else if (R[0][0] > R[1][1] && R[0][0] > R[2][2]) {
        const s = 2 * Math.sqrt(1 + R[0][0] - R[1][1] - R[2][2])
        q = [
            (R[2][1] - R[1][2]) / s,
            0.25 * s,
            (R[0][1] + R[1][0]) / s,
            (R[0][2] + R[2][0]) / s
        ]
    } else if (R[1][1] > R[2][2]) {
        const s = 2 * Math.sqrt(1 + R[1][1] - R[0][0] - R[2][2])
        q = [
            (R[0][2] - R[2][0]) / s,
            (R[0][1] + R[1][0]) / s,
            0.25 * s,
            (R[1][2] + R[2][1]) / s
        ]
    } else {
        const s = 2 * Math.sqrt(1 + R[2][2] - R[0][0] - R[1][1])
        q = [
            (R[1][0] - R[0][1]) / s,
            (R[0][2] + R[2][0]) / s,
            (R[1][2] + R[2][1]) / s,
            0.25 * s
        ]
    }

    const n = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3])
    return [q[0]/n, q[1]/n, q[2]/n, q[3]/n]
}

/**
 * Reflected random walk on [lo, hi].
 * Maintains detailed balance unlike clamping.
 */
function reflectBounded(x: number, lo: number, hi: number): number {
    const range = hi - lo
    // Reduce modulo 2·range
    let r = ((x - lo) % (2 * range) + 2 * range) % (2 * range)
    if (r > range) r = 2 * range - r
    return lo + r
}
