import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import { cloneMatrix3x3, deg2rad, Matrix3x3, newMatrix3x3 } from "../types/math"
import { multiplyTensors, transposeTensor } from "../types/math"
import { SearchMethod } from "./SearchMethod"
import { stressTensorDelta } from "./utils"

export type GridSearchParams = {
    deltaGridAngle?: number
    GridAngleHalfIntervalS?: number
    stressRatioHalfInterval?: number
    deltaStressRatio?: number

    /**
     * Number of free dimensions to sweep (2, 3, or 4).
     * Informational — the actual axes swept are controlled by sweepPhi/Theta/Alpha/R.
     * Default: 4 (all axes free).
     */
    dimension?: 2 | 3 | 4

    /** Sweep the φ (roll) Euler-angle offset?  Default: true */
    sweepPhi?: boolean
    /** Sweep the θ (pitch) Euler-angle offset? Default: true */
    sweepTheta?: boolean
    /** Sweep the α (yaw) Euler-angle offset?   Default: true */
    sweepAlpha?: boolean
    /** Sweep the stress ratio R?               Default: true */
    sweepR?: boolean

    /**
     * Fixed stress ratio value used when sweepR = false.
     * Defaults to the value set by setInteractiveSolution() (stressRatio0).
     */
    fixedR?: number
    /** Fixed φ offset (degrees) used when sweepPhi  = false. Default: 0 */
    fixedPhi?: number
    /** Fixed θ offset (degrees) used when sweepTheta = false. Default: 0 */
    fixedTheta?: number
    /** Fixed α offset (degrees) used when sweepAlpha = false. Default: 0 */
    fixedAlpha?: number
}

export type ExposedGridSearchParams = {
    deltaGridAngle : {
        show: false,
        displayName: "Delta grid angle",
        type: "number",
        range: [1,5]
    },
    stressRatio: {
        show: true,
        displayName: "Stress ratio",
        type: "number",
        range: [0,1]
    }
}

/**
 * Grid search over a 2-, 3-, or 4-dimensional parameter space around an
 * interactive starting solution.
 *
 * The four axes are:
 *   φ (roll), θ (pitch), α (yaw) — Euler-angle offsets around the starting Rrot
 *   R — stress ratio offset around stressRatio0
 *
 * Set sweepX = false to fix that axis at its `fixedX` value (default 0 offset /
 * stressRatio0 for R).  Exactly `dimension` axes should be free (not enforced,
 * but the intent).
 *
 * @category Search-Method
 */
export class GridSearch extends SearchMethod {
    private deltaGridAngle = 0
    private GridAngleHalfIntervalS = 0
    private stressRatioHalfInterval = 0
    private deltaStressRatio = 0
    private Rrot: Matrix3x3 = undefined
    private stressRatio0 = 0
    private engine: Engine = new HomogeneousEngine()

    // Dimensionality flags (defaults → 4D)
    private sweepPhi:   boolean
    private sweepTheta: boolean
    private sweepAlpha: boolean
    private sweepR:     boolean
    private fixedR:     number | undefined
    private fixedPhiRad:   number
    private fixedThetaRad: number
    private fixedAlphaRad: number

    constructor({
        deltaGridAngle         = 1,
        GridAngleHalfIntervalS = 30,
        stressRatioHalfInterval = 0.2,
        deltaStressRatio       = 0.01,
        sweepPhi               = true,
        sweepTheta             = true,
        sweepAlpha             = true,
        sweepR                 = true,
        fixedR,
        fixedPhi   = 0,
        fixedTheta = 0,
        fixedAlpha = 0,
    }: GridSearchParams = {}) {
        super()
        this.deltaGridAngle          = deltaGridAngle
        this.GridAngleHalfIntervalS  = GridAngleHalfIntervalS
        this.stressRatioHalfInterval = stressRatioHalfInterval
        this.deltaStressRatio        = deltaStressRatio
        this.sweepPhi                = sweepPhi
        this.sweepTheta              = sweepTheta
        this.sweepAlpha              = sweepAlpha
        this.sweepR                  = sweepR
        this.fixedR                  = fixedR
        this.fixedPhiRad             = deg2rad(fixedPhi)
        this.fixedThetaRad           = deg2rad(fixedTheta)
        this.fixedAlphaRad           = deg2rad(fixedAlpha)
    }

    setEngine(engine: Engine): void { this.engine = engine }
    getEngine(): Engine             { return this.engine }
    setOptions(_json: any): void    {}

    setInteractiveSolution({ rot, stressRatio }: { rot: Matrix3x3; stressRatio: number }): void {
        this.Rrot        = rot
        this.stressRatio0 = stressRatio
    }

    run(data: Data[], misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
        const nodesAngle = Math.ceil(this.GridAngleHalfIntervalS / this.deltaGridAngle)
        const nodesR     = Math.ceil(this.stressRatioHalfInterval / this.deltaStressRatio)
        const dAngle     = deg2rad(this.deltaGridAngle)

        // Build value arrays for each axis.
        // Free axes: [-N … +N] steps.  Fixed axes: single value.
        const phiOffsets   = this.sweepPhi   ? iRange(-nodesAngle, nodesAngle) : [0]
        const thetaOffsets = this.sweepTheta ? iRange(-nodesAngle, nodesAngle) : [0]
        const alphaOffsets = this.sweepAlpha ? iRange(-nodesAngle, nodesAngle) : [0]
        const rOffsets     = this.sweepR     ? iRange(-nodesR,     nodesR)     : [0]

        const fixedRValue = this.fixedR ?? this.stressRatio0

        let DTrot: Matrix3x3 = newMatrix3x3()
        let Drot:  Matrix3x3 = newMatrix3x3()
        let WTrot: Matrix3x3 = newMatrix3x3()
        let Wrot:  Matrix3x3 = newMatrix3x3()

        const newSolution = cloneMisfitCriteriunSolution(misfitCriteriaSolution)
        const total = phiOffsets.length * thetaOffsets.length * alphaOffsets.length * rOffsets.length
        let inc = 0

        for (const i of phiOffsets) {
            const deltaPhi = this.sweepPhi ? i * dAngle : this.fixedPhiRad
            const cosPhi = Math.cos(deltaPhi), sinPhi = Math.sin(deltaPhi)

            for (const j of thetaOffsets) {
                const deltaTheta = this.sweepTheta ? j * dAngle : this.fixedThetaRad
                const cosTheta = Math.cos(deltaTheta), sinTheta = Math.sin(deltaTheta)

                for (const k of alphaOffsets) {
                    const deltaAlpha = this.sweepAlpha ? k * dAngle : this.fixedAlphaRad
                    const cosAlpha = Math.cos(deltaAlpha), sinAlpha = Math.sin(deltaAlpha)

                    DTrot = rotationTensorDT(cosPhi, sinPhi, cosTheta, sinTheta, cosAlpha, sinAlpha)
                    Drot  = transposeTensor(DTrot)
                    WTrot = multiplyTensors({ A: transposeTensor(this.Rrot), B: DTrot })
                    Wrot  = transposeTensor(WTrot)

                    for (const l of rOffsets) {
                        const stressRatio = this.sweepR
                            ? this.stressRatio0 + l * this.deltaStressRatio
                            : fixedRValue

                        if (stressRatio < 0 || stressRatio > 1) continue

                        this.engine.setHypotheticalStress(Wrot, stressRatio)
                        const STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

                        const misfit = data.reduce((prev, cur) =>
                            prev + cur.cost({ stress: this.engine.stress(cur.position) })
                        , 0) / data.length

                        if (misfit < newSolution.misfit) {
                            newSolution.misfit               = misfit
                            newSolution.rotationMatrixD      = cloneMatrix3x3(Drot)
                            newSolution.rotationMatrixW      = cloneMatrix3x3(Wrot)
                            newSolution.stressRatio          = stressRatio
                            newSolution.stressTensorSolution = STdelta
                        }

                        inc++
                        const pct = (inc / total) * 100
                        if (pct % 10 < (1 / total) * 100) this.sendMessage(`${Math.floor(pct)}`)
                    }
                }
            }
        }

        return newSolution
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Integer range [lo, hi] inclusive */
function iRange(lo: number, hi: number): number[] {
    const out: number[] = []
    for (let i = lo; i <= hi; i++) out.push(i)
    return out
}

function rotationTensorDT(
    cosDeltaPhi: number, sinDeltaPhi: number,
    cosDeltaTheta: number, sinDeltaTheta: number,
    cosDeltaAlpha: number, sinDeltaAlpha: number
): Matrix3x3 {
    const DT: Matrix3x3 = newMatrix3x3()

    // Sigma_1 axis: Unit vector e1''
    DT[0][0] =   cosDeltaPhi * cosDeltaTheta
    DT[1][0] =   sinDeltaPhi * cosDeltaTheta
    DT[2][0] = - sinDeltaTheta

    // Sigma_3 axis: Unit vector e2''
    DT[0][1] = - sinDeltaPhi * cosDeltaAlpha + cosDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[1][1] =   cosDeltaPhi * cosDeltaAlpha + sinDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[2][1] =   cosDeltaTheta * sinDeltaAlpha

    // Sigma_2 axis: Unit vector e3''
    DT[0][2] =   sinDeltaPhi * sinDeltaAlpha + cosDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[1][2] = - cosDeltaPhi * sinDeltaAlpha + sinDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[2][2] =   cosDeltaTheta * cosDeltaAlpha

    return DT
}
