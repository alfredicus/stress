import { Data } from "../data"
import { Engine, HomogeneousEngine } from "../geomeca"
import { Matrix3x3, newMatrix3x3, transposeTensor } from "../types"

export type ComputeMisfitAtParams = {
    data: Data[]
    /** φ in radians — absolute ZXZ Euler angle */
    phi: number
    /** θ in radians — absolute ZXZ Euler angle */
    theta: number
    /** ψ in radians — absolute ZXZ Euler angle */
    psi: number
    /** Stress ratio R ∈ [0, 1] */
    R: number
    /** Reuse a shared engine instance to avoid allocation overhead in loops */
    engine?: Engine
}

/**
 * Compute mean data misfit for an absolute (φ, θ, ψ, R) parameter set.
 *
 * Uses ZXZ Euler convention with Rrot = identity (absolute angles, not offsets).
 * Reuse one HomogeneousEngine instance across calls when sweeping a grid.
 */
export function computeMisfitAt({
    data, phi, theta, psi, R, engine = new HomogeneousEngine()
}: ComputeMisfitAtParams): number {
    if (data.length === 0 || R < 0 || R > 1) return NaN

    const DTrot = rotationTensorDT(
        Math.cos(phi), Math.sin(phi),
        Math.cos(theta), Math.sin(theta),
        Math.cos(psi), Math.sin(psi)
    )
    // Rrot = identity  →  Wrot = Drot = transpose(DTrot)
    const Wrot = transposeTensor(DTrot)

    engine.setHypotheticalStress(Wrot, R)
    return data.reduce((sum, d) =>
        sum + d.cost({ stress: engine.stress(d.position) })
        , 0) / data.length
}

// -----------------------------------

function rotationTensorDT(
    cosDeltaPhi: number, sinDeltaPhi: number,
    cosDeltaTheta: number, sinDeltaTheta: number,
    cosDeltaAlpha: number, sinDeltaAlpha: number
): Matrix3x3 {
    const DT: Matrix3x3 = newMatrix3x3()

    // Sigma_1 axis: Unit vector e1''
    DT[0][0] = cosDeltaPhi * cosDeltaTheta
    DT[1][0] = sinDeltaPhi * cosDeltaTheta
    DT[2][0] = - sinDeltaTheta

    // Sigma_3 axis: Unit vector e2''
    DT[0][1] = - sinDeltaPhi * cosDeltaAlpha + cosDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[1][1] = cosDeltaPhi * cosDeltaAlpha + sinDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[2][1] = cosDeltaTheta * sinDeltaAlpha

    // Sigma_2 axis: Unit vector e3''
    DT[0][2] = sinDeltaPhi * sinDeltaAlpha + cosDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[1][2] = - cosDeltaPhi * sinDeltaAlpha + sinDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[2][2] = cosDeltaTheta * cosDeltaAlpha

    return DT
}
