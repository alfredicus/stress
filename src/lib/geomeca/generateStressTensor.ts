import { eigen } from "@youwol/math"
import { assertBetween } from "../debug"
import { Matrix3x3, SphericalCoords, multiplyTensors, newMatrix3x3Identity, properRotationTensor, spherical2unitVectorCartesian, transposeTensor } from "../types"
import { HypotheticalSolutionTensorParameters } from "./HypotheticalSolutionTensorParameters"
import { fromRotationsToTensor } from "./fromRotationsToTensor"
import { HomogeneousEngine } from "./HomogeneousEngine"

/**
 * 
 * @param phi angle representing azimuth [0, 2PI) 
 * @param theta angle representing the colatitude [0, PI).
 * the arcos function ensures a uniform distribution for theta from a value.
 * @param angle We only consider positive rotation angles around each
 * rotation axis, since the whole sphere is covered by angles (phi,theta)
 * @param R The stress ratio in [0, 1]
 * @returns 
 */
export function generateStressTensor(phi: number, theta: number, angle: number, R: number): HypotheticalSolutionTensorParameters {
    assertBetween(angle, 0, Math.PI)
    assertBetween(R, 0, 1)

    const a = new SphericalCoords()

    // phi = variable representing azimuth [0, 2PI)
    a.phi = phi

    // theta = random variable representing the colatitude [0, PI)
    //      the arcos function ensures a uniform distribution for theta from a random value:
    a.theta = theta

    let rotAxis = spherical2unitVectorCartesian(a)

    // We only consider positive rotation angles around each rotation axis, since the whole sphere is covered by angles (phi,theta)
    let rotAngle = angle

    // Calculate rotation tensors Drot and DTrot between systems Sr and Sw such that:
    //  Vr  = DTrot Vw        (DTrot is tensor Drot transposed)
    //  Vw = Drot  Vr

    // DTrot is the transformation matrix between systems Sw and Sr such that Sr is rotated a clockwise angle = rotAngle along rotation axis rotAxis
    const DTrot = properRotationTensor({ nRot: rotAxis, angle: rotAngle })

    // Drot is the transformation matrix between systems Sr and Sw such that Sw is rotated an ANTI-clockwise angle = rotAngle along rotation axis rotAxis
    //  Note that the rotation axis is the same vector for references systems Sr and Sw. Its coordinates do not change under rotation about itself.
    const Drot = transposeTensor(DTrot)
    // Calculate rotation tensors Wrot and WTrot between systems S and Sw: WTrot = RTrot DTrot, such that:
    //  V   = WTrot Vw        (WTrot is tensor Wrot transposed)
    //  Vw = Wrot  V
    //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
    //  Sw =  (Xw, Yw, Zw ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2) ('w' stands for 'winning' solution)
    const Rrot = newMatrix3x3Identity()
    const RTrot = transposeTensor(Rrot)
    const WTrot = multiplyTensors({ A: RTrot, B: DTrot })
    //  Wrot = Drot Rrot
    const Wrot = transposeTensor(WTrot)

    const stressRatio = R

    return fromRotationsToTensor(Wrot, stressRatio)
}

export function generateStressTensorFromTensor(s: Matrix3x3): HypotheticalSolutionTensorParameters {
    const { values, vectors } = eigen([s[0][0], s[0][1], s[0][2], s[1][1], s[1][2], s[2][2]])
    return {
        // eigen calculates the 3 eigenvectors and eigenvalues in the following order: Sigma_3, Sigma_2, Sigma_1
        S: s,
        S1_X: [vectors[6], vectors[7], vectors[8]],
        S3_Y: [vectors[0], vectors[1], vectors[2]],
        S2_Z: [vectors[3], vectors[4], vectors[5]],
        s1_X: values[2],
        s3_Y: values[0],
        s2_Z: values[1],

        // The reference systmem corresponding to the hypothetical solution is defined by
        //      Sh = (Xh, Yh, Zh) = (Sigma_1, Sigma_3, Sigma_2) acccording to a strike-slip regime
        // This definition enables to plot the flow lines using a parametric equation in spherical coordinates,
        //      that bahaves 'prperly' near the principal axis
        // Moreover, this definition has no consequence on the solution tensor.
        // Hrot is the transformation matrix between the geographic reference system S and Sh :

        //  V   = HTrot Vh        (HTrot is tensor Wrot transposed)
        //  Vh = Hrot  V
        //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.

        // The rows of matrix Hrot are defined by the normalized eigenvectors Sigma_1, Sigma_3, Sigma_2 
        // This reference system is in principle right-handed
        Hrot: [
            [vectors[6], vectors[7], vectors[8]],
            [vectors[0], vectors[1], vectors[2]],
            [vectors[3], vectors[4], vectors[5]]
        ]
    }
}

export function generateStressTensorFromHRot(Hrot: Matrix3x3, R: number): HypotheticalSolutionTensorParameters {
    const h = new HomogeneousEngine(Hrot, R)
    return h.stress([0, 0, 0])
}
