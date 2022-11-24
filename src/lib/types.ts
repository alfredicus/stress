
export type Point2D = [number, number]
export type Point3D = [number, number, number]
export function newPoint3D() {
    return [0,0,0]
}

export type Matrix3x3 = [[number,number,number], [number,number,number], [number,number,number]]

export function newMatrix3x3(): Matrix3x3 {
    return [[0,0,0], [0,0,0], [0,0,0]] as Matrix3x3
}

// class Matrix3x3 {
//     private v = [[0,0,0], [0,0,0], [0,0,0]]
    
//     set(i: number, j: number, value: number) {
//         this.v[i][j] = value
//     }
// }

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
