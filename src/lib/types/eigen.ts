// From @youwol/math/eigen

const EPS = 0.00001
const MAX_ITER = 100
const xcpi = Math.cos(Math.PI / 4)
const xspi = Math.sin(Math.PI / 4)

/**
 * @param mat The symmetric matrix in a packed array of the form
 * of 6 components [xx, xy, xz, yy, yz, zz] or 9 components
 * [xx, xy, xz, yx, yy, yz, zx, zy, zz]
 * @returns {values, vectors} where values=[v1, v2, v3] and
 * vectors=[v1x, v1y, v1z,  v2x, v2y, v2z,  v3x, v3y, v3z]
 * @note Eigen values and vectors are ordered from the highest to the lowest
 *
 * @category Eigen
 */
export function EIGEN(mat: Array<number>): {
    values: number[]
    vectors: number[]
} {
    const values: Array<number> = []
    const vectors: Array<number> = []
    const a: Array<number> = []
    const v: Array<number> = []
    const index: Array<number> = []
    let nb_iter = 0,
        thr_nn = 0,
        jj = 0,
        k = 0,
        ik = 0,
        im = 0,
        iq = 0,
        il = 0,
        a_ij = 0,
        a_im = 0,
        a_il = 0,
        v_ilv = 0,
        v_imv = 0,
        x = 0,
        sinx = 0,
        cosx = 0

    let n = 0
    if (mat.length === 3) {
        n = 2
        a[0] = mat[0]
        a[1] = mat[1]
        a[2] = mat[2]
    } else if (mat.length === 4) {
        n = 2
        a[0] = mat[0]
        a[1] = mat[1]
        a[2] = mat[3]
    } else if (mat.length === 6) {
        n = 3
        a[0] = mat[0]
        a[1] = mat[1]
        a[2] = mat[3]
        a[3] = mat[2]
        a[4] = mat[4]
        a[5] = mat[5]
    } else if (mat.length === 9) {
        n = 3
        a[0] = mat[0]
        a[1] = mat[1]
        a[2] = mat[4]
        a[3] = mat[2]
        a[4] = mat[5]
        a[5] = mat[8]
    } else {
        throw new Error(`matrix-array should be of size 2 (xx,xy,yy),
        4 (xx,xy,yx,yy), 6 (xx,xy,xz,yy,yz,zz) or 9 (xx,xy,xz,yx,yy,yz,zx,zy,zz).
        Got ${mat.length}`)
    }

    const nn = (n * (n + 1)) / 2
    let ij = 0
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
            if (i === j) {
                v[ij++] = 1.0
            } else {
                v[ij++] = 0.0
            }
        }
    }

    ij = 1
    let a_norm = 0.0
    for (let i = 1; i <= n; ++i) {
        for (let j = 1; j <= i; ++j) {
            if (i !== j) {
                a_ij = a[ij - 1]
                a_norm += a_ij * a_ij
            }
            ++ij
        }
    }

    if (a_norm !== 0.0) {
        const a_normEPS = a_norm * EPS
        let thr = a_norm

        while (thr > a_normEPS && nb_iter < MAX_ITER) {
            ++nb_iter
            thr_nn = thr / nn
            for (let l = 1; l < n; ++l) {
                for (let m = l + 1; m <= n; ++m) {
                    const lq = (l * l - l) / 2
                    const mq = (m * m - m) / 2
                    const lm = l + mq
                    const a_lm = a[lm - 1]
                    const a_lm_2 = a_lm * a_lm

                    if (a_lm_2 < thr_nn) {
                        continue
                    }

                    const ll = l + lq
                    const mm = m + mq
                    const a_ll = a[ll - 1]
                    const a_mm = a[mm - 1]
                    const delta = a_ll - a_mm

                    if (delta === 0.0) {
                        x = -Math.PI / 4
                        sinx = xspi
                        cosx = xcpi
                    } else {
                        x = -Math.atan((a_lm + a_lm) / delta) / 2.0
                        sinx = Math.sin(x)
                        cosx = Math.cos(x)
                    }

                    const sinx_2 = sinx * sinx
                    const cosx_2 = cosx * cosx
                    const sincos = sinx * cosx
                    let ilv = n * (l - 1)
                    let imv = n * (m - 1)

                    for (let i = 1; i <= n; ++i) {
                        if (i !== l && i !== m) {
                            iq = (i * i - i) / 2
                            if (i < m) {
                                im = i + mq
                            } else {
                                im = m + iq
                            }
                            a_im = a[im - 1]
                            if (i < l) {
                                il = i + lq
                            } else {
                                il = l + iq
                            }
                            a_il = a[il - 1]
                            a[il - 1] = a_il * cosx - a_im * sinx
                            a[im - 1] = a_il * sinx + a_im * cosx
                        }
                        ++ilv
                        ++imv
                        v_ilv = v[ilv - 1]
                        v_imv = v[imv - 1]
                        v[ilv - 1] = cosx * v_ilv - sinx * v_imv
                        v[imv - 1] = sinx * v_ilv + cosx * v_imv
                    }

                    x = a_lm * sincos
                    x += x
                    a[ll - 1] = a_ll * cosx_2 + a_mm * sinx_2 - x
                    a[mm - 1] = a_ll * sinx_2 + a_mm * cosx_2 + x
                    a[lm - 1] = 0.0
                    thr = Math.abs(thr - a_lm_2)
                }
            }
        }
    }

    for (let i = 0; i < n; ++i) {
        k = i + (i * (i + 1)) / 2
        values[i] = a[k]
        index[i] = i
    }

    for (let i = 0; i < n - 1; ++i) {
        x = values[i]
        k = i
        for (let j = i + 1; j < n; ++j) {
            if (x < values[j]) {
                k = j
                x = values[j]
            }
        }
        values[k] = values[i]
        values[i] = x
        jj = index[k]
        index[k] = index[i]
        index[i] = jj
    }

    ij = 0
    for (let k = 0; k < n; ++k) {
        ik = index[k] * n
        for (let i = 0; i < n; ++i) {
            vectors[ij++] = v[ik++]
        }
    }

    return { values, vectors }
}

// ------------------------------------------------------------------
// For compatibility reason...
// ------------------------------------------------------------------

// Array of 6 elements
//      Order is [11, 12, 13, 22, 23, 33]
// Array of 9 elements
//      Order is [11, 12, 13, 21, 22, 23, 31, 32, 33]
// if we consider the matrix
// | 11 12 13 |
// | 12 22 23 |
// | 13 23 33 |
//

/**
 * Computes the eigen values and eigen vectors of a semi definite symmetric matrix
 * @param {number[]} mat Format: [00, 01, 02, 11, 12, 22]
 * @returns {{number[], Array.<Array.<number>>}} The eigen values and eigen vectors
 * @note Eigen -values and -vectors are ordered from the highest to the lowest
 * @see [[eigen]]
 * @category Eigen
 * @ignore
 */
export class Eigen {
    private eigenValues: Array<number> = []
    private eigenVectors: Array<number> = []

    constructor() {
        console.warn('Deprecated class. Use instead eigen(mat: Array<number>')
    }

    /**
     * @see eigen()
     */
    compute(mat: Array<number>): { values: number[]; vectors: number[] } {
        const r = EIGEN(mat)
        this.eigenValues = r.values
        this.eigenVectors = r.vectors
        return r
    }

    vector(i: number): Array<number> {
        console.assert(i >= 0 && i < 3)
        return [
            this.eigenVectors[3 * i],
            this.eigenVectors[3 * i + 1],
            this.eigenVectors[3 * i + 2],
        ]
    }

    get vectors(): Array<number> {
        return this.eigenVectors
    }

    value(i: number): number {
        console.assert(i >= 0 && i < 3)
        return this.eigenValues[i]
    }

    get values(): Array<number> {
        return this.eigenValues
    }
}