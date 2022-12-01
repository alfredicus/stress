import { Curve3D } from "./Curve3D"
import { Matrix3x3, MohrPoint, newPoint3D, Point3D, SphericalCoords } from "./types"

export function deg2rad(a: number): number {
    return a*Math.PI/180
}

export const rad2deg = (a: number): number => a/Math.PI*180

export function mohrCircleLine(
    {r, first, second, sigma_1, sigma_2, sigma_3}:
    {r: number, first: MohrPoint, second: MohrPoint, sigma_1: number, sigma_2: number, sigma_3: number}): string
{
    const lineBuilder = new Curve3D()

    if (sigma_2 == sigma_3) {
        // Particular Case 1: revolution stress tensor around sigma_1
        // In such situation, points pO and p1 have equal coordinates and alfa angles
        // Curve is a circle sweeping at an angle alfa0 around sigma_1
        return arcCircle({r: r, sigma: 'sigma_1', alpha: first.angle})
    }
    else if (sigma_2 == sigma_1) {
        // Particular Case 2: revolution stress tensor around sigma_3
        // In such situation, points pO and p1 have equal coordinates and alfa angles
        // Curve is a circle sweeping at an angle PI/2 - alfa0 around sigma_3
        return arcCircle({r: r, sigma: 'sigma_3', alpha: Math.PI / 2 - first.angle})
    }
    else {
        // General Case:
        // Add to the list the initial point of the line segment located in one of the 3 Mohr circles
        lineBuilder.addPoint(mohrCirclePoint( {mohrCirc: first.circle, alfa: first.angle, r} ))

        // Add to the list the intermediate points of the line segment located between 2 Mohr circles
        // We calculate the direction cosines of the unit vector normal to the fault whose stress state is given by (X, Y)
        //      Note that (X,Y) are the normal and shear stress of a moving point along the Mohr-Coulomb line segment 

        // Without loss of generality, we suppose a stress tensor in strike-slip regime (fixing sigma_1 Eastward and sigma_3 Northward)
        let sigma_X = sigma_1
        let sigma_Y = sigma_3
        let sigma_Z = sigma_2

        for (let i = 1; i < 180; ++i) {
            let X = first.p[0] + (second.p[0] - first.p[0]) * i / 180
            let Y = first.p[1] + (second.p[1] - first.p[1]) * i / 180

            let nx = Math.sqrt(((sigma_Y - X) * (sigma_Z - X) + Y ** 2) / ((sigma_Y - sigma_X) * (sigma_Z - sigma_X)))
            let ny = Math.sqrt(((sigma_Z - X) * (sigma_X - X) + Y ** 2) / ((sigma_Z - sigma_Y) * (sigma_X - sigma_Y)))
            let nz = Math.sqrt(((sigma_X - X) * (sigma_Y - X) + Y ** 2) / ((sigma_X - sigma_Z) * (sigma_Y - sigma_Z)))

            const x = r * nx
            const y = r * ny
            const z = r * nz

            lineBuilder.addPoint(x, y, z)
        }

        // Add to the list the final point of the line segment located in one of the 3 Mohr circles
        lineBuilder.addPoint(mohrCirclePoint( {mohrCirc: second.circle, alfa: second.angle, r} ))

        return lineBuilder.buffer
    }
}

export function mohrCirclePoint(
    {r, mohrCirc, alfa}:
    {r: number, mohrCirc: string, alfa: number}): Point3D
{
    // Add to the list the initial or final point of the line segment located in one of the 3 Mohr circles

    if (mohrCirc == '3_1') {
        // The point is located in Mohr circle between sigma_3 and sigma_1
        // alfa is the azimuthal angle in the reference frame (x,y,z) = (sigma_1,sigma_3, sigma_2) = (East, North, Up)
        const theta = Math.PI / 2
        const phi = alfa

        return [
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta)
        ]
    }
    else if (mohrCirc == '3_2') {
        // The point is located in Mohr circle between sigma_3 and sigma_2
        // alfa is the polar angle in the reference frame (x,y,z) = (sigma_1,sigma_3, sigma_2) = (East, North, Up)
        const theta = alfa
        const phi = Math.PI / 2
        return [
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta)
        ]

    }
    else {
        // MohrCirc == '2_1'
        // The point is located in Mohr circle between sigma_2 and sigma_1
        // alfa is the latitude angle in the reference frame (x,y,z) = (sigma_1,sigma_3, sigma_2) = (East, North, Up)
        const theta = Math.PI / 2 - alfa
        const phi = 0
        return [
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta)
        ]
    }
}

/**
 * Usage:
 * ```ts
 * const arc = arcCircle({alpha: deg2rad(12), sigma: '3_1'})
 * ```
 */
export function arcCircle(
    {r, sigma, alpha}:
    {r: number, sigma: string, alpha: number}): string
{

    const lineBuilder = new Curve3D()

    if (sigma === 'sigma_1') {
        // Particular case 1: sigma_2 = sigma_3 (revolution stress tensor around sigma_1)
        // Generate a circular segment (one quarter of a circle) sweeping an angle alfa around sigma_1
        const x = r * Math.cos(alpha)
        const rad_circle = r * Math.sin(alpha)

        for (let i = 1; i <= 180; ++i) {

            let beta = Math.PI * i / 360

            const y = rad_circle * Math.cos(beta)
            const z = rad_circle * Math.sin(beta)

            lineBuilder.addPoint(x, y, z)
        }
    }

    else if (sigma === 'sigma_3') {
        // Particular case 2: sigma_2 = sigma_1 (revolution stress tensor around sigma_3)
        // Generate a circular segment (one quarter of a circle) sweeping an angle alfa around sigma_3
        const y = r * Math.cos(alpha)
        const rad_circle = r * Math.sin(alpha)

        for (let i = 1; i <= 180; ++i) {

            let beta = Math.PI * i / 360

            const x = rad_circle * Math.cos(beta)
            const z = rad_circle * Math.sin(beta)

            lineBuilder.addPoint(x, y, z)
        }
    }

    return lineBuilder.buffer
}

export function lineSphericalCoords(
    {trend, plunge}:
    {trend: number, plunge: number}): SphericalCoords
{
    // The principal stress axes and microfault data such as stylolites can be represented by lines.
    // A line is defined by its trend and plunge angles in the geographic reference system:
    // trend = azimuth of the line in interval [0, 360), measured clockwise from the North direction
    // plunge =  vertical angle between the horizontal plane and the sigma 1 axis (positive downward), in interval [0,90]

    // (phi,theta) : spherical coordinate angles defining the unit vector in the geographic reference system: S = (X,Y,Z) = (E,N,Up)
    
    // phi : azimuthal angle in interval [0, 2 PI), measured anticlockwise from the X axis (East direction) in reference system S
    // theta: colatitude or polar angle in interval [0, PI/2], measured downward from the zenith (upward direction)

    let phi = trend2phi(trend)

    let theta = deg2rad( plunge ) + Math.PI / 2

    return new SphericalCoords({phi, theta})
}

export function trend2phi(trend: number): number {
    // Calculate the value of phi from the trend
    // trend = azimuth of the line in interval [0, 360), measured clockwise from the North direction
    // phi : azimuthal angle in interval [0, 2 PI), measured anticlockwise from the X axis (East direction) in reference system S

    // trend + phi = 5 PI / 4
    let phi = 5 * Math.PI / 4 - deg2rad( trend )

    if ( phi >= 2 * Math.PI) {
        phi -= 2 * Math.PI
    }
    return phi
}

export function VectorRot(
    {V, RT}:
    {V: Point3D, RT: Matrix3x3 }): Point3D
{
    // We calculate vector VT in the the geographic reference frame form vector V in the principal stress reference frame, 
    // using the rotation matrix RT (R Transposed) :
    //      X = RT X',  where X and X' are vectors in refereence frames S and S'
    const VT = newPoint3D() as Point3D
    VT[0] = RT[0][0] * V[0] + RT[0][1] * V[1] + RT[0][2] * V[2] 
    VT[1] = RT[1][0] * V[0] + RT[1][1] * V[1] + RT[1][2] * V[2] 
    VT[2] = RT[2][0] * V[0] + RT[2][1] * V[1] + RT[2][2] * V[2] 

    return VT
}


export function fault(
    {r, sigma, alpha}:
    {r: number, sigma: string, alpha: number})
{
    // Each fault is defined by a set of parameters as follows:
    //      The fault plane orientation is defined by three parameters:
    //      Fault strike: clockwise angle measured from the North direction [0, 360)
    //      Strike direction (optional): (N, E, S, W) or a combination of two direction (NE, SE, SW, NW).
    //      Fault dip: [0, 90]
    //      Dip direction: (N, E, S, W) or a combination of two directions (NE, SE, SW, NW).

    // Optional information on fault plane:

    // curved fault plane
    // length (mm, m dm)


    // The striation is defined in two possible ways (which are exclusive):
    // 1-   Rake (or pitch) [0,90], measured from the Azimuth alpha (alpha points in one of the two directions of the fault strike)
    //      Azimuth alpha direction: (N, E, S, W) or a combination of two directions (NE, SE, SW, NW)
    //      Rake direction: (N, E, S, W) or a combination of two directions (NE, SE, SW, NW).
    // 2-   For shallow-dipping planes:
    //      Striae trend: [0, 360)

    // Sense of mouvement: Normal, Reverse, Right-Lateral, Left-Lateral, or a combination of two.

    // The type of striation can be indicated (optional parameter):
    // Fully striated plane
    // Ploughing elements
    // Crystallized material linked to iiregularities in the fault surface (e.g. calcite)
    //      Calcite fibers

    // Secondary fractures:
    //      T criteria
    //          Tensile fractures
    //          Crescentic fractures
    //
    //      R Criteria
    //          Riedel shears
    //          Lunate fractures
    //
    //      P criteria
    //
    // dissolution
    // Reactivated (phase 2)
    // Curved striation
    // Tensile fractures
    // R' : high angle antithetic secondary shears

}
