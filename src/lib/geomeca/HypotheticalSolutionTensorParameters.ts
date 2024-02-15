import { Matrix3x3, Vector3, newMatrix3x3 } from "../types"

/**
 * @brief Decomposition of a strain/stress tensor (eigen)
 */
export class HypotheticalSolutionTensorParameters {
    private S_: Matrix3x3
    // Normalized eigen vectors
    private S1_: Vector3
    private S2_: Vector3
    private S3_: Vector3
    // Eigen values
    private s1_: number
    private s2_: number
    private s3_: number
    // Transformation matrix
    private Hrot_: Matrix3x3

    constructor(
        { S, S1_X, S2_Z, S3_Y, s1_X, s2_Z, s3_Y, Hrot }: {
        S?: Matrix3x3
        // Normalized eigen vectors
        S1_X?: Vector3
        S2_Z?: Vector3
        S3_Y?: Vector3
        // Eigen values
        s1_X?: number
        s2_Z?: number
        s3_Y?: number
        // Transformation matrix
        Hrot?: Matrix3x3
    } = {}) {
        if (S) this.S_ = S

        if (S1_X) this.S1_ = S1_X
        if (S2_Z) this.S2_ = S2_Z
        if (S3_Y) this.S3_ = S3_Y

        if (s1_X !== undefined) this.s1_ = s1_X
        if (s2_Z !== undefined) this.s2_ = s2_Z
        if (s3_Y !== undefined) this.s3_ = s3_Y

        if (Hrot) this.Hrot_ = Hrot
    }

    get S() {return this.S_}
    get S1_X() {return this.S1_}
    get S2_Z() {return this.S2_}
    get S3_Y() {return this.S3_}
    get s1_X() {return this.s1_}
    get s2_Z() {return this.s2_}
    get s3_Y() {return this.s3_}
    get Hrot() {return this.Hrot_}

    get R() {
        return (this.s2_Z - this.s3_Y) / (this.s1_X - this.s3_Y)
    }
}
