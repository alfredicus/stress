import { Matrix3x3 } from "../types"
import { MCMCSample } from "./MCMC"

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Orientation statistics for one principal stress axis,
 * computed from the posterior chain samples.
 */
export type AxisOrientationStats = {
    /** Mean axis direction (unit vector, downward hemisphere convention) */
    meanVector: [number, number, number]
    /** Azimuth from North, clockwise [0°, 360°) */
    trend: number
    /** Inclination from horizontal, positive downward [0°, 90°] */
    plunge: number
    /**
     * Fisher mean resultant length R̄ ∈ [0, 1].
     * R̄ ≈ 1 → tightly clustered (well-constrained axis).
     * R̄ ≈ 0 → uniformly dispersed (unconstrained axis).
     */
    meanResultantLength: number
    /** 95 % Fisher confidence cone half-angle (degrees) */
    fisherCone95: number
    /** 68 % Fisher confidence cone half-angle (~1σ equivalent, degrees) */
    fisherCone68: number
}

/**
 * Full orientation-statistics block returned alongside the standard
 * stress-ratio / Euler-angle statistics.
 */
export type StressAxesStats = {
    sigma1: AxisOrientationStats   // Maximum principal stress (most compressive)
    sigma2: AxisOrientationStats   // Intermediate principal stress
    sigma3: AxisOrientationStats   // Minimum principal stress (least compressive)
    /**
     * Geodesic distance on SO(3) from each posterior sample to the
     * best-fit rotation matrix.  Measures overall orientation uncertainty
     * as a single angle.
     *   mean  : average rotation angle (degrees)
     *   std   : standard deviation of rotation angles (degrees)
     *   q05   : 5th percentile
     *   q95   : 95th percentile
     */
    rotationAngle: { mean: number; std: number; q05: number; q95: number }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Compute stress-axis orientation statistics and the SO(3) rotation-angle
 * distribution from a posterior chain.
 *
 * @param chain       Post-burn-in (optionally thinned) MCMC/MC samples.
 * @param bestFitWrot Rotation matrix of the best-fit solution (lowest misfit).
 *                    Required for the rotation-angle statistic; if omitted,
 *                    the mean rotation is used instead.
 */
export function computeStressAxesStats(
    chain: MCMCSample[],
    bestFitWrot?: Matrix3x3
): StressAxesStats | null {
    if (chain.length < 2) return null

    // ── Extract principal-axis unit vectors for every sample ──────────────
    // Row permutation [0, 2, 1] of Wrot, matching eigenvalue sort order:
    //   row 0 → σ₁ (eigenvalue −1, max compression)
    //   row 2 → σ₂ (eigenvalue −R, intermediate)
    //   row 1 → σ₃ (eigenvalue  0, min compression)
    const s1Vecs: [number, number, number][] = []
    const s2Vecs: [number, number, number][] = []
    const s3Vecs: [number, number, number][] = []

    for (const s of chain) {
        s1Vecs.push([s.Wrot[0][0], s.Wrot[0][1], s.Wrot[0][2]])
        s2Vecs.push([s.Wrot[2][0], s.Wrot[2][1], s.Wrot[2][2]])
        s3Vecs.push([s.Wrot[1][0], s.Wrot[1][1], s.Wrot[1][2]])
    }

    // ── Axis orientation stats ─────────────────────────────────────────────
    const sigma1 = axisOrientationStats(s1Vecs)
    const sigma2 = axisOrientationStats(s2Vecs)
    const sigma3 = axisOrientationStats(s3Vecs)

    // ── Rotation-angle distribution ────────────────────────────────────────
    const refWrot = bestFitWrot ?? meanRotationMatrix(chain)
    const angles  = chain.map(s => rotationAngleDeg(refWrot, s.Wrot))
    const rotationAngle = scalarStats(angles)

    return { sigma1, sigma2, sigma3, rotationAngle }
}

// ─── Fisher statistics for one axis ───────────────────────────────────────────

function axisOrientationStats(vecs: [number, number, number][]): AxisOrientationStats {
    // Antipodal alignment: flip each vector so it lies in the same hemisphere
    // as the first sample (dot product with reference ≥ 0).
    const ref = vecs[0]
    const aligned: [number, number, number][] = vecs.map(v =>
        dot3(v, ref) >= 0 ? v : [-v[0], -v[1], -v[2]]
    )

    // Mean vector (not yet normalized)
    const mx = mean(aligned.map(v => v[0]))
    const my = mean(aligned.map(v => v[1]))
    const mz = mean(aligned.map(v => v[2]))

    // Mean resultant length R̄ = |mean vector|
    const Rbar = Math.sqrt(mx * mx + my * my + mz * mz)

    // Normalize to get the mean direction
    const nx = Rbar > 1e-10 ? mx / Rbar : 0
    const ny = Rbar > 1e-10 ? my / Rbar : 0
    const nz = Rbar > 1e-10 ? mz / Rbar : 0

    // Downward-hemisphere convention:
    // If the mean vector points upward (nz > 0), flip it so plunge ≥ 0.
    const sign  = nz > 0 ? -1 : 1
    const [ex, ey, ez] = [sign * nx, sign * ny, sign * nz]

    // Trend: azimuth from North (Y), clockwise → atan2(East, North)
    const trendRad = Math.atan2(ex, ey)
    const trend = ((trendRad * 180 / Math.PI) + 360) % 360

    // Plunge: inclination below horizontal, positive downward
    // ez ≤ 0 (downward hemisphere), so −ez ≥ 0
    const plunge = Math.asin(Math.max(-1, Math.min(1, -ez))) * 180 / Math.PI

    return {
        meanVector:          [ex, ey, ez],
        trend:               parseFloat(trend.toFixed(1)),
        plunge:              parseFloat(plunge.toFixed(1)),
        meanResultantLength: parseFloat(Rbar.toFixed(4)),
        fisherCone95:        fisherCone(Rbar, 95),
        fisherCone68:        fisherCone(Rbar, 68)
    }
}

// ─── Fisher confidence cone (same formula as in the TeX document) ─────────────

function fisherCone(Rbar: number, pLevel: number): number {
    if (Rbar <= 0 || Rbar >= 1) return Rbar >= 1 ? 0 : NaN
    const p   = pLevel / 100
    const arg = 1 - ((1 - Rbar) / Rbar) * Math.log(1 / (1 - p))
    const deg = Math.acos(Math.max(-1, Math.min(1, arg))) * 180 / Math.PI
    return parseFloat(deg.toFixed(1))
}

// ─── SO(3) rotation angle ─────────────────────────────────────────────────────

/**
 * Geodesic distance between two rotation matrices on SO(3) (degrees).
 * angle = arccos( (trace(R₁ᵀ R₂) − 1) / 2 )
 */
function rotationAngleDeg(R1: Matrix3x3, R2: Matrix3x3): number {
    // trace(R1^T * R2) = Σᵢⱼ R1[i][j] * R2[i][j]
    let tr = 0
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            tr += R1[i][j] * R2[i][j]
    const cosAngle = Math.max(-1, Math.min(1, (tr - 1) / 2))
    return Math.acos(cosAngle) * 180 / Math.PI
}

/**
 * Approximate mean rotation matrix as the element-wise average of the chain,
 * re-orthogonalized via SVD-free normalization (good enough for a reference).
 * Used only when no best-fit Wrot is provided.
 */
function meanRotationMatrix(chain: MCMCSample[]): Matrix3x3 {
    const M: Matrix3x3 = [[0,0,0],[0,0,0],[0,0,0]]
    for (const s of chain)
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                M[i][j] += s.Wrot[i][j]
    const n = chain.length
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            M[i][j] /= n
    // Re-orthogonalize rows via Gram-Schmidt
    return gramSchmidt(M)
}

function gramSchmidt(M: Matrix3x3): Matrix3x3 {
    const u0 = normalize3(M[0])
    const u1 = normalize3(sub3(M[1], scale3(u0, dot3(M[1], u0))))
    const u2 = cross3(u0, u1)
    return [u0, u1, u2]
}

// ─── Scalar statistics ────────────────────────────────────────────────────────

function scalarStats(arr: number[]): { mean: number; std: number; q05: number; q95: number } {
    const m  = mean(arr)
    const s  = Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length)
    const sorted = [...arr].sort((a, b) => a - b)
    return {
        mean: parseFloat(m.toFixed(2)),
        std:  parseFloat(s.toFixed(2)),
        q05:  parseFloat(quantile(sorted, 0.05).toFixed(2)),
        q95:  parseFloat(quantile(sorted, 0.95).toFixed(2))
    }
}

// ─── Vector helpers ───────────────────────────────────────────────────────────

const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

function quantile(sorted: number[], q: number): number {
    const pos = q * (sorted.length - 1)
    const lo  = Math.floor(pos)
    const hi  = Math.ceil(pos)
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

function dot3(a: [number,number,number], b: [number,number,number]): number {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

function sub3(a: number[], b: number[]): [number,number,number] {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]
}

function scale3(a: [number,number,number], s: number): [number,number,number] {
    return [a[0]*s, a[1]*s, a[2]*s]
}

function cross3(a: [number,number,number], b: [number,number,number]): [number,number,number] {
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ]
}

function normalize3(v: number[]): [number,number,number] {
    const n = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    return n > 1e-10 ? [v[0]/n, v[1]/n, v[2]/n] : [1, 0, 0]
}
