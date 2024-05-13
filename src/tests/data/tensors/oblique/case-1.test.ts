import { 
    HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, 
    Sqrt2Over4, Sqrt3Over2, Sqrt6Over4, Vector3, constant_x_Vector, deg2rad, newVector3D,
    normalizeVector,
    normalizedCrossProduct, scalarProduct, scalarProductUnitVectors, unitVectorCartesian2Spherical, 
} from "../../../../lib"

import { SphericalCoords } from "../../../../lib/types/SphericalCoords"

import { HypotheticalSolutionTensorParameters } from "../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../doTestStress"

// ----------------------------------------------------------------

// Oblique Regime, Tensor 1

let n7 = [ 1/6, 2/3, 1/6] as Vector3
n7 = normalizeVector(n7)                // normal to striated plane No 7
const dip7 = Math.atan(Math.sqrt(17))
const nst7 = [Sqrt2Over2, 0, - Sqrt2Over2] as Vector3 // unit vector parallel to striation
const strike7 = Math.atan(1/4)
const nstrike7 = [Math.cos(strike7), - Math.sin(strike7), 0] as Vector3 // unit vector parallel to strike
const rake7 = Math.acos(scalarProductUnitVectors( { U : nst7, V : nstrike7} ))

const datas = [
    {
        id: 1,
        type: "Extension Fracture",
        strike: 63.43495,
        dip: 48.189685,
        dipDirection: 'NW',
        normal: [ - Math.cos(deg2rad(70.528779)), Sqrt2Over2 * Math.sin(deg2rad(70.528779)), Sqrt2Over2 * Math.sin(deg2rad(70.528779))]
    },    {
        id: 2,
        type: "Extension Fracture",
        strike: 243.43495,
        dip: 48.189685,
        dipDirection: 'NW',
        normal: [ - Math.cos(deg2rad(70.528779)), Sqrt2Over2 * Math.sin(deg2rad(70.528779)), Sqrt2Over2 * Math.sin(deg2rad(70.528779))]
    },
    {
        id: 3,
        type: "Stylolite Interface",
        strike: 135,
        dip: 70.528779,            // 180 - 2 * 54.7356 
        dipDirection: 'SW',
        normal: [- Sqrt2Over2 * Math.sin(deg2rad(70.528779)), - Sqrt2Over2 * Math.sin(deg2rad(70.528779)), Math.cos(deg2rad(70.528779))]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 315,
        dip: 70.528779,            // 180 - 2 * 54.7356 
        dipDirection: 'W',
        normal: [- Sqrt2Over2 * Math.sin(deg2rad(70.528779)), - Sqrt2Over2 * Math.sin(deg2rad(70.528779)), Math.cos(deg2rad(70.528779))]
    },
    {
        id: 5,
        type: "Striated Plane",
        strike: 135,
        dip: 54.7356,
        dipDirection: 'NE',
        rake: 60,
        strikeDirection: 'SE',
        typeOfMovement: 'I_LL',
        normal: [ OneOverSqrt3, OneOverSqrt3, OneOverSqrt3 ]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 315,
        dip: 54.7356,
        dipDirection: 'N',
        rake: 60,
        strikeDirection: 'E',
        typeOfMovement: 'LL',
        normal: [ OneOverSqrt3, OneOverSqrt3, OneOverSqrt3 ]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: strike7 + 90,
        dip: dip7,
        dipDirection: 'NE',
        rake: rake7,
        strikeDirection: 'SE',
        typeOfMovement: 'I_LL',
        normal: [n7[0], n7[1], n7[2] ] // Normal vector calculated before 
    }
    /*,
    
    {
        id: 5,
        type: "Striated Plane",
        strike: 45,
        dip: 60,
        dipDirection: 'NW',
        rake: 90,
        strikeDirection: 'SW',
        typeOfMovement: 'N',
        normal: [-Sqrt6Over4, Sqrt6Over4, 0.5]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 225,
        dip: 60,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [-Sqrt6Over4, Sqrt6Over4, 0.5]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: 135,
        dip: 30,
        dipDirection: 'SW',
        rake: 90,
        strikeDirection: 'SE',
        typeOfMovement: 'N',
        normal: [-Sqrt2Over4, -Sqrt2Over4, Sqrt3Over2]
    },
    {
        id: 8,
        type: "Striated Plane",
        strike: 315,
        dip: 30,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [-Sqrt2Over4, -Sqrt2Over4, Sqrt3Over2]
    },
    {
        id: 9,
        type: "Striated Plane",
        strike: 75,
        dip: 90,
        dipDirection: 'NW',
        rake: 0,
        strikeDirection: 'SW',
        typeOfMovement: 'LL',
        normal: [Math.cos(7*Math.PI/12), Math.sin(7*Math.PI/12), 0]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 255,
        dip: 90,
        dipDirection: 'N',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'LL',
        normal: [Math.cos(19*Math.PI/12), Math.sin(19*Math.PI/12), 0]
    },
    {
        id: 11,
        type: "Striated Plane",
        strike: 90,
        dip: 54.7356,
        dipDirection: 'S',
        rake: 60,
        strikeDirection: 'E',
        typeOfMovement: 'N_LL',
        normal: [ 0, -Math.sqrt(2/3), OneOverSqrt3]
    },
    {
        id: 12,
        type: "Striated Plane",
        strike: 270,
        dip: 54.7356,
        dipDirection: 'S',
        rake: 60,
        strikeDirection: 'E',
        typeOfMovement: 'N_LL',
        normal: [ 0, -Math.sqrt(2/3), OneOverSqrt3]
    }

    */
]


const R = 0.5

/*

const stressTensor = [
    [-R/2, -R/2, 0],
    [-R/2, -R/2, 0],
    [0, 0, -1]
]

*/


// nPRV = proper rotation vector perpendicular to planes 1 and 2
const nPRV = [ OneOverSqrt3, OneOverSqrt3, OneOverSqrt3 ] as Vector3
const spheriCoords = unitVectorCartesian2Spherical(nPRV) as SphericalCoords // phi = pi/4, theta = acos (1/sqrt(3)) = 54.7356
// alpha = anticlockwise rotation angle 
const alpha = Math.PI / 3

const properRotationVector = [spheriCoords.phi, spheriCoords.theta, alpha, R]

const thetaX2 = 2 * spheriCoords.theta
const c2th = Math.cos(thetaX2)
const s2thXk = Math.sin(thetaX2) * Sqrt2Over2

const rotationMatrix = {
    rot: [[s2thXk, s2thXk, c2th],
    [c2th, s2thXk, s2thXk],
    [s2thXk, c2th, s2thXk]],
    R
}





// ----------------------------------------------------------------
//         PRIVATE : DO NOT CHANGE ANYTHING BELOW THIS LINE
// ----------------------------------------------------------------

/*
test('oblique stress tensor', () => {
    const stress = generateStressTensorFromTensor(stressTensor as Matrix3x3) as HypotheticalSolutionTensorParameters
    doTestStress({datas, stress, msg: 'stress tensor'})
    expect(R).toBeCloseTo(stress.R)
})
*/

test('oblique tensor from proper rotation vector', () => {
    const stress = generateStressTensor(properRotationVector[0], properRotationVector[1], properRotationVector[2], properRotationVector[3])
    doTestStress({stress, datas, msg: 'proper rotation vector'})
    expect(R).toBeCloseTo(stress.R)
})

test('oblique tensor from rotation matrix', () => {
    const stress = generateStressTensorFromHRot(rotationMatrix.rot as Matrix3x3, rotationMatrix.R)
    doTestStress({stress, datas, msg: 'Hrot'})
    expect(R).toBeCloseTo(stress.R)
})
