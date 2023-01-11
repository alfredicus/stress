
export type Point2D = [number, number]
export type Point3D = [number, number, number]
export type Vector3 = [number, number, number]

export class SphericalCoords {
    private theta_ = 0
    private phi_   = 0

    // SphericalCoords()
    // SphericalCoords({phi: 10})
    // SphericalCoords({theta: 120})
    // SphericalCoords({theta: 2, phi: 10})
    constructor(
        {phi=0, theta=0}:
        {phi?: number, theta?: number} = {})
    {
        // check bounds of theta and phi if any
        this.theta_ = theta ? theta : 0
        this.phi_   = phi   ? phi   : 0
    }

    /**
     * @see constructor
     */
    static create(
        {phi=0, theta=0}:
        {phi?: number, theta?: number} = {})
    {
        return new SphericalCoords({phi, theta})
    }

    // const c = new SphericalCoords(1,2)
    // or
    // const c = SphericalCoords.create(1,2)
    // c.theta = 900
    get theta() {
        return this.theta_
    }
    set theta(v: number) {
        // check bounds of theta
        this.theta_ = v
    }

    get phi() {
        return this.phi_
    }
    set phi(v: number) {
        this.phi_ = v
    }
}

export class PoleCoords {
    private trend_  = 0
    private plunge_ = 0

    constructor(
        {trend=0, plunge=0}:
        {trend?: number, plunge?: number} = {})
    {
        // check bounds of theta and phi if any
        this.trend_  = trend ? trend : 0
        this.plunge_ = plunge? plunge   : 0
    }

    get trend() {
        return this.trend_
    }
    set trend(v: number) {
        // check bounds of theta
        this.trend_ = v
    }

    get plunge() {
        return this.plunge_
    }
    set plunge(v: number) {
        this.plunge_ = v
    }
}

export class StressTensor {
    stressTensor_: Matrix3x3
    private rotationTensorR_: Matrix3x3
    private rotationTensorRT_: Matrix3x3
    private polarCoordsS1_: PoleCoords
    private polarCoordsS3_: PoleCoords
    private stressRatio_: number


    constructor(
        stressTensor_: Matrix3x3,
        rotationTensorR_: Matrix3x3,
        rotationTensorRT_: Matrix3x3,
        polarCoordsS1_: PoleCoords,
        polarCoordsS3_: PoleCoords,
        stressRatio_: number)
        {
        // this.stressTensor_ = 
        }
    
    get stressTensor(): Matrix3x3 {
        return this.stressTensor_
    }
    set stressTensor(value: Matrix3x3) {
        this.stressTensor_ = value
    }

}


export function newPoint3D() {
    return [0,0,0] as Point3D
}

export function newVector3D() {
    return [0,0,0] as Vector3
}

export type Matrix3x3 = [[number,number,number], [number,number,number], [number,number,number]]

export function newMatrix3x3(): Matrix3x3 {
    return [[0,0,0], [0,0,0], [0,0,0]] as Matrix3x3
}

export function cloneMatrix3x3(m: Matrix3x3): Matrix3x3 {
    return [ [...m[0]], [...m[1]], [...m[2]] ]
}

export function newMatrix3x3Identity(): Matrix3x3 {
    return [[1,0,0], [0,1,0], [0,0,1]] as Matrix3x3
}

/**
 * Usage:
 * ```ts
 * const p1 = {
 *      p     : [0,0],
 *      angle : deg2rad(10),
 *      circle: '3_1'
 * }
 * 
 * const p2 = {
 *      angle : deg2rad(10),
 *      p     : [0,0],
 *      circle: '3_1'
 * }
 * ```
 */
export type MohrPoint = {
    p     : Point2D,
    angle : number,
    circle: string
}

/**
 * ```ts
 * const curves = []
 * curves.push( new EquipotentialCurve(), new MohrCoulombCurve(), new MohrCoulombCurve(), new IntegralCurve() )
 * ```
 */
export interface GenericCurve {
    /**
     * Return the generated curve as a GOCAD PLine string, or an empty
     * string if nothing to draw.
     * @param theta 
     * @param phi 
     */
    generate(theta: number, phi: number): string
}
