import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import { cloneMatrix3x3, Matrix3x3 } from "../types"
import { SearchMethod } from "./SearchMethod"
import { MCMCSample } from "./MCMC"
import { computeStressAxesStats, StressAxesStats } from "./axisStats"

// Unit quaternion: [q0 (scalar), q1, q2, q3 (vector)]
type Quaternion = [number, number, number, number]

export type MonteCarloQuaternionParams = {
    nbRandomTrials?: number
    topFraction?: number   // Top fraction to keep as accepted samples (default 0.05 = top 5%)
}

/**
 * Monte Carlo stress inversion using uniform quaternion sampling on SO(3).
 *
 * Differences from MonteCarlo (rotation-matrix version):
 *  1. Orientations are sampled uniformly on SO(3) via the quaternion method:
 *     draw four independent N(0,1) values (u0, u1, u2, u3), normalize to get
 *     a unit quaternion q = u/|u|.  This gives an exact, singularity-free
 *     uniform distribution on S³ and hence on SO(3).
 *  2. Stress ratio R is drawn uniformly on [0, 1] (full range) — no half-interval
 *     or starting point is needed.
 *  3. No Metropolis–Hastings step; every sample is independent.
 *
 * The top `topFraction` of samples (by misfit) are kept as the accepted set,
 * consistent with the existing MonteCarlo class.
 *
 * @category Search-Method
 */
export class MonteCarloQuaternion extends SearchMethod {
    private nbRandomTrials: number
    private topFraction: number
    private engine: Engine = new HomogeneousEngine()
    private allTrials: MCMCSample[] = []
    private bestFitWrot: Matrix3x3 | undefined

    constructor({
        nbRandomTrials = 20000,
        topFraction    = 0.05
    }: MonteCarloQuaternionParams = {}) {
        super()
        this.nbRandomTrials = nbRandomTrials
        this.topFraction    = topFraction
    }

    setOptions(json: any): void {
        if (json.nbIter !== undefined) this.nbRandomTrials = json.nbIter
    }

    getEngine(): Engine { return this.engine }
    setEngine(engine: Engine): void { this.engine = engine }

    setInteractiveSolution(_: { rot: Matrix3x3; stressRatio: number }): void {
        // Uniform sampling has no starting point — ignore interactive solution
    }

    getChain(): MCMCSample[] {
        if (this.allTrials.length === 0) return []
        const sorted = [...this.allTrials].sort((a, b) => a.misfit - b.misfit)
        const cutoff = Math.max(1, Math.ceil(sorted.length * this.topFraction))
        return sorted.slice(0, cutoff)
    }

    getStats(): {
        acceptanceRate: number
        chainLength: number
        stressRatio: { mean: number; std: number; q05: number; q95: number }
        misfit: { mean: number; std: number; min: number }
        eulerAngles: {
            phi:   { mean: number; std: number; q05: number; q95: number }
            theta: { mean: number; std: number; q05: number; q95: number }
            psi:   { mean: number; std: number; q05: number; q95: number }
        }
        distributions: {
            stressRatio: number[]
            phi:   number[]
            theta: number[]
            psi:   number[]
        }
        axesStats?: StressAxesStats
    } | null {
        const chain = this.getChain()
        if (chain.length === 0) return null

        const ratios  = chain.map(s => s.stressRatio)
        const misfits = chain.map(s => s.misfit)

        const mean     = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
        const std      = (arr: number[], m: number) =>
            Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
        const quantile = (sorted: number[], q: number) => {
            const pos = q * (sorted.length - 1)
            const lo  = Math.floor(pos)
            const hi  = Math.ceil(pos)
            return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
        }

        const ratioMean   = mean(ratios)
        const sortedRatios = [...ratios].sort((a, b) => a - b)
        const misfitMean  = mean(misfits)

        // Euler angles (ZXZ convention) from Wrot — row permutation [0,2,1]
        const RAD2DEG = 180 / Math.PI
        const phiArr:   number[] = []
        const thetaArr: number[] = []
        const psiArr:   number[] = []

        for (const sample of chain) {
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
            acceptanceRate: this.topFraction * 100,
            chainLength:    chain.length,
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
            axesStats: computeStressAxesStats(chain, this.bestFitWrot) ?? undefined
        }
    }

    run(dataset: Data[], misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
        const newSolution = cloneMisfitCriteriunSolution(misfitCriteriaSolution)
        this.allTrials    = []
        this.bestFitWrot  = undefined

        for (let i = 0; i < this.nbRandomTrials; i++) {
            // ── Uniform quaternion on S³ (Shepperd / Gaussian method) ──────────
            // Draw four independent N(0,1) and normalize → exact uniform SO(3)
            const u0 = gaussianRandom()
            const u1 = gaussianRandom()
            const u2 = gaussianRandom()
            const u3 = gaussianRandom()
            const qn = Math.sqrt(u0*u0 + u1*u1 + u2*u2 + u3*u3)
            const q: Quaternion = [u0/qn, u1/qn, u2/qn, u3/qn]

            // ── Stress ratio: uniform on [0, 1] ───────────────────────────────
            const stressRatio = Math.random()

            // ── Convert quaternion → rotation matrix → misfit ─────────────────
            const Wrot = quaternionToMatrix(q)
            this.engine.setHypotheticalStress(Wrot, stressRatio)
            const misfit = dataset.reduce((cost, data) =>
                cost + data.cost({ stress: this.engine.stress(data.position) }) * data.weight
            , 0) / dataset.length

            // ── Track best solution ───────────────────────────────────────────
            if (misfit < newSolution.misfit) {
                newSolution.misfit               = misfit
                newSolution.rotationMatrixW      = cloneMatrix3x3(Wrot)
                newSolution.stressRatio          = stressRatio
                newSolution.stressTensorSolution = this.engine.S()
                this.bestFitWrot                 = cloneMatrix3x3(Wrot)
            }

            this.allTrials.push({ stressRatio, Wrot: cloneMatrix3x3(Wrot), misfit })

            const pct = (i / this.nbRandomTrials) * 100
            if (pct % 10 === 0) this.sendMessage(`${pct}`)
        }

        return newSolution
    }
}

// ─── Quaternion helpers ────────────────────────────────────────────────────────

/** Unit quaternion → rotation matrix */
function quaternionToMatrix(q: Quaternion): [
    [number, number, number],
    [number, number, number],
    [number, number, number]
] {
    const [q0, q1, q2, q3] = q
    return [
        [1 - 2*(q2*q2 + q3*q3),  2*(q1*q2 - q0*q3),      2*(q1*q3 + q0*q2)     ],
        [2*(q1*q2 + q0*q3),      1 - 2*(q1*q1 + q3*q3),  2*(q2*q3 - q0*q1)     ],
        [2*(q1*q3 - q0*q2),      2*(q2*q3 + q0*q1),      1 - 2*(q1*q1 + q2*q2) ]
    ]
}

/** Box-Muller standard normal */
function gaussianRandom(): number {
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}
