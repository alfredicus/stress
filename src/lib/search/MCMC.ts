import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import {
    cloneMatrix3x3, Matrix3x3, multiplyTensors,
    newMatrix3x3Identity, properRotationTensor,
    spherical2unitVectorCartesian, SphericalCoords, transposeTensor
} from "../types"
import { SearchMethod } from "./SearchMethod"
import { computeStressAxesStats, StressAxesStats } from "./axisStats"

export type MCMCParams = {
    nbIterations?: number,
    burnIn?: number,
    temperature?: number,
    rotAngleStepSize?: number,
    stressRatioStepSize?: number,
    stressRatio?: number,
    Rrot?: Matrix3x3
}

export type MCMCSample = {
    stressRatio: number,
    Wrot: Matrix3x3,
    misfit: number
}

/**
 * MCMC search method using the Metropolis-Hastings algorithm.
 * Provides better convergence than brute-force Monte Carlo and
 * stores posterior samples for uncertainty estimation.
 * @category Search-Method
 */
export class MCMC extends SearchMethod {
    private nbIterations: number
    private burnIn: number
    private temperature: number
    private rotAngleStepSize: number
    private stressRatioStepSize: number
    private stressRatio0: number
    private Rrot: Matrix3x3 = undefined
    private RTrot: Matrix3x3 = undefined
    private engine: Engine = new HomogeneousEngine()
    private chain: MCMCSample[] = []
    private acceptedCount: number = 0
    private bestFitWrot: Matrix3x3 | undefined

    constructor(
        { stressRatio = 0.5, nbIterations = 50000, burnIn = 0.2, temperature = 0.05,
          rotAngleStepSize = 5, stressRatioStepSize = 0.05,
          Rrot = newMatrix3x3Identity() }: MCMCParams = {}
    ) {
        super()
        this.nbIterations = nbIterations
        this.burnIn = burnIn
        this.temperature = temperature
        this.rotAngleStepSize = rotAngleStepSize * Math.PI / 180
        this.stressRatioStepSize = stressRatioStepSize
        this.stressRatio0 = stressRatio
        this.Rrot = Rrot
        this.RTrot = transposeTensor(this.Rrot)
    }

    setOptions(json: any): void {
        if (json.nbIter !== undefined) {
            this.nbIterations = json.nbIter
        }
    }

    getEngine(): Engine {
        return this.engine
    }

    setEngine(engine: Engine): void {
        this.engine = engine
    }

    setInteractiveSolution({ rot, stressRatio }: { rot: Matrix3x3, stressRatio: number }): void {
        this.Rrot = rot
        this.stressRatio0 = stressRatio
    }

    getChain(): MCMCSample[] {
        return this.chain
    }

    getStats(): {
        acceptanceRate: number,
        chainLength: number,
        stressRatio: { mean: number, std: number, q05: number, q95: number },
        misfit: { mean: number, std: number, min: number },
        eulerAngles: {
            phi: { mean: number, std: number, q05: number, q95: number },
            theta: { mean: number, std: number, q05: number, q95: number },
            psi: { mean: number, std: number, q05: number, q95: number }
        },
        distributions: {
            stressRatio: number[],
            phi: number[],
            theta: number[],
            psi: number[]
        },
        axesStats?: StressAxesStats
    } | null {
        if (this.chain.length === 0) return null

        const n = this.chain.length
        const ratios = this.chain.map(s => s.stressRatio)
        const misfits = this.chain.map(s => s.misfit)

        const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
        const std = (arr: number[], m: number) =>
            Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
        const quantile = (sorted: number[], q: number) => {
            const pos = q * (sorted.length - 1)
            const lo = Math.floor(pos)
            const hi = Math.ceil(pos)
            return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
        }

        const ratioMean = mean(ratios)
        const sortedRatios = [...ratios].sort((a, b) => a - b)
        const misfitMean = mean(misfits)

        // Extract Euler angles (ZXZ convention) from each Wrot sample, convert to degrees.
        // The stress tensor eigenvalues are (-1, 0, -R). Sorted by |σ| descending: -1, -R, 0
        // which corresponds to Wrot rows 0, 2, 1. decomposeStressTensor uses the eigenvector
        // matrix with this row order, so we must apply the same permutation here to get
        // consistent Euler angles.
        const RAD2DEG = 180 / Math.PI
        const phiArr: number[] = []
        const thetaArr: number[] = []
        const psiArr: number[] = []

        for (const sample of this.chain) {
            const w = sample.Wrot
            // Permuted rotation matrix: rows [0, 2, 1] of Wrot (matching eigenvector sort order)
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
            chainLength: n,
            stressRatio: {
                mean: ratioMean,
                std: std(ratios, ratioMean),
                q05: quantile(sortedRatios, 0.05),
                q95: quantile(sortedRatios, 0.95)
            },
            misfit: {
                mean: misfitMean,
                std: std(misfits, misfitMean),
                min: Math.min(...misfits)
            },
            eulerAngles: {
                phi: angleStats(phiArr),
                theta: angleStats(thetaArr),
                psi: angleStats(psiArr)
            },
            distributions: {
                stressRatio: ratios,
                phi: phiArr,
                theta: thetaArr,
                psi: psiArr
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

        // Initialize current state from the starting rotation
        let currentRTrot = cloneMatrix3x3(this.RTrot)
        let currentStressRatio = this.stressRatio0

        // Compute initial Wrot and misfit
        let currentWTrot = cloneMatrix3x3(currentRTrot)
        let currentWrot = transposeTensor(currentWTrot)
        let currentMisfit = this.computeMisfit(dataset, currentWrot, currentStressRatio)

        // Initialize best solution
        newSolution.misfit = currentMisfit
        newSolution.rotationMatrixW = cloneMatrix3x3(currentWrot)
        newSolution.stressRatio = currentStressRatio
        newSolution.stressTensorSolution = this.engine.S()

        for (let i = 0; i < this.nbIterations; i++) {
            // Propose new rotation: small perturbation around current state
            const rotAxisSpheCoords = new SphericalCoords()
            rotAxisSpheCoords.phi = Math.random() * 2 * Math.PI
            rotAxisSpheCoords.theta = Math.acos(2 * Math.random() - 1)
            const rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

            const rotAngle = this.gaussianRandom() * this.rotAngleStepSize

            const DTrot = properRotationTensor({ nRot: rotAxis, angle: rotAngle })

            // New WTrot = currentRTrot * DTrot
            const proposedWTrot = multiplyTensors({ A: currentRTrot, B: DTrot })
            const proposedWrot = transposeTensor(proposedWTrot)

            // Propose new stress ratio
            const proposedStressRatio = Math.max(0, Math.min(1,
                currentStressRatio + this.gaussianRandom() * this.stressRatioStepSize
            ))

            // Compute misfit for proposed state
            const proposedMisfit = this.computeMisfit(dataset, proposedWrot, proposedStressRatio)

            // Metropolis acceptance criterion
            const alpha = Math.exp(-(proposedMisfit - currentMisfit) / this.temperature)
            if (Math.random() < alpha) {
                // Accept proposal
                currentRTrot = proposedWTrot
                currentWrot = proposedWrot
                currentStressRatio = proposedStressRatio
                currentMisfit = proposedMisfit
                this.acceptedCount++
            }

            // Update best solution
            if (currentMisfit < newSolution.misfit) {
                newSolution.misfit = currentMisfit
                newSolution.rotationMatrixW = cloneMatrix3x3(currentWrot)
                newSolution.stressRatio = currentStressRatio
                newSolution.stressTensorSolution = this.engine.S()
                this.bestFitWrot = cloneMatrix3x3(currentWrot)
            }

            // Store sample after burn-in
            if (i >= burnInCount) {
                this.chain.push({
                    stressRatio: currentStressRatio,
                    Wrot: cloneMatrix3x3(currentWrot),
                    misfit: currentMisfit
                })
            }

            // Progress reporting at 10% intervals
            const pct = (i / this.nbIterations) * 100
            if (pct % 10 === 0) {
                this.sendMessage(`${pct}`)
            }
        }

        return newSolution
    }
}
