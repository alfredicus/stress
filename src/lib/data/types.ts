import { Point3D, Vector3 } from "../types"

/**
 * @category Data
 */
export enum FractureStrategy {
    ANGLE,
    // Criteriun similar or equivalent to the one implemented in the Gephart & Forsyth method (1984)
    MIN_TENSOR_ROT,
    // Criteriun similar to the one implemented in the Etchecopar et al. method (1981)
    MIN_STRIATION_ANGULAR_DIF,
    DOT
}

/**
 * @category Data
 */
export type FractureParams = {
    n: Vector3, 
    pos?: Point3D, 
    strategy?: FractureStrategy, 
    weight?: number
}

export type Line = {
    trend: number,
    plunge: number
}

export type RuptureFrictionAngles = {
    isDefined: boolean,
    angleMin: number,
    angleMax: number
}
export function createRuptureFrictionAngles(): RuptureFrictionAngles {
    return {
        isDefined: false,
        angleMin: 0,
        angleMax: 0
    }
}

/**
 * 
 */
export type Sigma1_nPlaneAngle = RuptureFrictionAngles
export function createSigma1_nPlaneAngle() {
    return createRuptureFrictionAngles()
}

// Seismological data file

export type NodalPlane = {
    strike: number,
    dip: number,
    rake: number
}
export function createNodalPlane(): NodalPlane {
    return {
        strike: 0,
        dip: 0,
        rake: 0
    }
}
