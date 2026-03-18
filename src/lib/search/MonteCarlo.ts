import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { generateStressTensor } from "../geomeca/generateStressTensor"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import {
    cloneMatrix3x3, Matrix3x3, multiplyTensors,
    newMatrix3x3, newMatrix3x3Identity, Pi, properRotationTensor,
    rand,
    spherical2unitVectorCartesian, SphericalCoords, transposeTensor, TwoPi
} from "../types"
import { MCMCSample } from "./MCMC"
import { SearchMethod } from "./SearchMethod"
import { computeStressAxesStats, StressAxesStats } from "./axisStats"
// import { stressTensorDelta } from "./utils"

export type MonteCarloParams = {
    rotAngleHalfInterval?: number,
    nbRandomTrials?: number,
    stressRatio?: number,
    stressRatioHalfInterval?: number,
    Rrot?: Matrix3x3
}

/**
 * @category Search-Method
 */
export class MonteCarlo extends SearchMethod {
    private rotAngleHalfInterval: number
    private nbRandomTrials: number
    private stressRatioHalfInterval: number
    private stressRatio0: number
    private Rrot: Matrix3x3 = undefined
    private RTrot: Matrix3x3 = undefined
    private engine: Engine = new HomogeneousEngine()
    private allTrials: MCMCSample[] = []
    private topFraction: number = 0.05
    private bestFitWrot: Matrix3x3 | undefined

    constructor(
        { stressRatio = 0.5, stressRatioHalfInterval = 0.5, rotAngleHalfInterval = Math.PI, nbRandomTrials = 20000, Rrot = newMatrix3x3Identity() }:
            MonteCarloParams = {}) {
        super()
        this.rotAngleHalfInterval = rotAngleHalfInterval
        this.nbRandomTrials = nbRandomTrials
        this.stressRatio0 = stressRatio
        this.stressRatioHalfInterval = stressRatioHalfInterval
        this.Rrot = Rrot
        this.RTrot = transposeTensor(this.Rrot)
    }

    setOptions(json: any): void {
        if (json.nbIter !== undefined) {
            this.setNbIter(json.nbIter)
        }
    }

    setNbIter(n: number) {
        this.nbRandomTrials = n
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
        if (this.allTrials.length === 0) return []
        const sorted = [...this.allTrials].sort((a, b) => a.misfit - b.misfit)
        const cutoff = Math.max(1, Math.ceil(sorted.length * this.topFraction))
        return sorted.slice(0, cutoff)
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
        const chain = this.getChain()
        if (chain.length === 0) return null

        const n = chain.length
        const ratios = chain.map(s => s.stressRatio)
        const misfits = chain.map(s => s.misfit)

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

        // Euler angles (ZXZ convention) from Wrot — same row permutation [0,2,1] as MCMC
        const RAD2DEG = 180 / Math.PI
        const phiArr: number[] = []
        const thetaArr: number[] = []
        const psiArr: number[] = []

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
            axesStats: computeStressAxesStats(chain, this.bestFitWrot) ?? undefined
        }
    }

    run(dataset: Data[], misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
        // The optimum stress tensor is calculated by exploring the stress orientations and the stress ratio around the approximate solution Sr (r = rough solution)
        // obtained by the user during the interactive analysis of flow lines on the sphere, Mohr circle diagram, and histogram of signed angular deviations.
        // More precisely, the minimization function is calculated for a set of stress tensors whose orientations are rotated around axes 
        // defined by a Montecarlo algorithm distributed "quasi-homogeneously" on the sphere surface.
        // The magnitude of rotations and the stress ratio are also defined by random variables calculated within specified intervals.

        // Stress ratio variation stressRatioHalfInterval around R = (S2-S3)/(S1-S3), is constrained to interval [0,1]
        let stressRatioMin = Math.max(0, Math.abs(this.stressRatio0) - this.stressRatioHalfInterval)
        let stressRatioMax = Math.min(1, Math.abs(this.stressRatio0) + this.stressRatioHalfInterval)

        let stressRatioEffectiveInterval = stressRatioMax - stressRatioMin

        // console.log(this.stressRatio0, stressRatioMin, stressRatioMax, stressRatioEffectiveInterval)

        let DTrot: Matrix3x3 = newMatrix3x3()
        let Drot: Matrix3x3 = newMatrix3x3()
        let WTrot: Matrix3x3 = newMatrix3x3()
        let Wrot: Matrix3x3 = newMatrix3x3()

        let rotAxisSpheCoords = new SphericalCoords

        let inc = 0

        // console.log('Starting the montecarlo search...')

        let changed = false
        const newSolution = cloneMisfitCriteriunSolution(misfitCriteriaSolution)
        this.allTrials = []
        this.bestFitWrot = undefined

        for (let i = 0; i <= this.nbRandomTrials; i++) {
            // For each trial, a rotation axis in the unit sphere is calculated from a uniform random distribution.

            // phi = random variable representing azimuth [0, 2PI)
            rotAxisSpheCoords.phi = Math.random() * 2 * Math.PI
            // theta = random variable representing the colatitude [0, PI)
            //      the arcos function ensures a uniform distribution for theta from a random value:
            rotAxisSpheCoords.theta = Math.acos(2 * Math.random() - 1)

            let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

            // We only consider positive rotation angles around each rotation axis, since the whole sphere is covered by angles (phi,theta)
            let rotAngle = Math.random() * this.rotAngleHalfInterval

            // Calculate rotation tensors Drot and DTrot between systems Sr and Sw such that:
            //  Vr  = DTrot Vw        (DTrot is tensor Drot transposed)
            //  Vw = Drot  Vr

            // DTrot is the transformation matrix between systems Sw and Sr such that Sr is rotated a clockwise angle = rotAngle along rotation axis rotAxis
            DTrot = properRotationTensor({ nRot: rotAxis, angle: rotAngle })

            // Drot is the transformation matrix between systems Sr and Sw such that Sw is rotated an ANTI-clockwise angle = rotAngle along rotation axis rotAxis
            //  Note that the rotation axis is the same vector for references systems Sr and Sw. Its coordinates do not change under rotation about itself.
            Drot = transposeTensor(DTrot)
            // Calculate rotation tensors Wrot and WTrot between systems S and Sw: WTrot = RTrot DTrot, such that:
            //  V   = WTrot Vw        (WTrot is tensor Wrot transposed)
            //  Vw = Wrot  V
            //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
            //  Sw =  (Xw, Yw, Zw ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2) ('w' stands for 'winning' solution)
            WTrot = multiplyTensors({ A: this.RTrot, B: DTrot })
            //  Wrot = Drot Rrot
            Wrot = transposeTensor(WTrot)

            // Stress ratio variation around R = (S2-S3)/(S1-S3)
            let stressRatio = stressRatioMin + Math.random() * stressRatioEffectiveInterval // The strees ratio is in interval [0,1]

            // Calculate the stress tensor STdelta in reference frame S from the stress tensor in reference frame Sw
            // STdelta is defined according to the continuum mechanics sign convention : compression < 0
            // COMMENTED BELOW
            // let STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

            this.engine.setHypotheticalStress(Wrot, stressRatio)

            const misfit = dataset.reduce((cost, data) =>
                cost + data.cost({ stress: this.engine.stress(data.position) }) * data.weight
                , 0) / dataset.length // WARNING TO THE LENGTH vs WEIGHT

            if (misfit < newSolution.misfit) {
                newSolution.misfit = misfit
                newSolution.rotationMatrixD = cloneMatrix3x3(Drot)
                newSolution.rotationMatrixW = cloneMatrix3x3(Wrot)
                newSolution.stressRatio = stressRatio
                newSolution.stressTensorSolution = this.engine.S() // was STdelta
                this.bestFitWrot = cloneMatrix3x3(Wrot)
            }

            this.allTrials.push({
                stressRatio,
                Wrot: cloneMatrix3x3(Wrot),
                misfit
            })

            inc++

            const cur = i / this.nbRandomTrials * 100
            if (cur % 10 === 0) {
                this.sendMessage(`${cur}`)
            }
        }
        return newSolution

    }
}
