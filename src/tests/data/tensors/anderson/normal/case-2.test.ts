import { 
    HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, 
    Sqrt2Over4, Sqrt3Over2, Sqrt6Over4, Vector3, constant_x_Vector, newVector3D,
    normalizedCrossProduct, scalarProduct, unitVectorCartesian2Spherical, 
} from "../../../../../lib"

import { SphericalCoords } from "../../../../../lib/types/SphericalCoords"

import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Normal Regime, Tensor 2

const datas = [
    {
        id: 1,
        type: "Extension Fracture",
        strike: 45,
        dip: 90,
        dipDirection: 'SE',
        normal: [-Sqrt2Over2, Sqrt2Over2, 0]
    },
    {
        id: 2,
        type: "Extension Fracture",
        strike: 225,
        dip: 90,
        dipDirection: 'N',
        normal: [Sqrt2Over2, -Sqrt2Over2, 0]
    },
    {
        id: 3,
        type: "Stylolite Interface",
        strike: 50,
        dip: 0,
        dipDirection: 'N',
        normal: [0, 0, 1]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 350,
        dip: 0,
        dipDirection: 'N',
        normal: [0, 0, 1]
    },
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


    /*
    
   
    {
        id: 5,
        type: "Striated Plane",
        strike: 150,
        dip: 90,
        dipDirection: 'NE',
        rake: 0,
        strikeDirection: 'NW',
        typeOfMovement: 'RL',
        normal: [Sqrt3Over2, 0.5, 0]
    }
    */
]

    /*

export const datas = [
    ['1', 'Extension Fracture', '135', '90', 'NE'],
    ['2', 'Extension Fracture', '315', '90', 'W']
    ['3', 'Stylolite Interface', '0', '0', 'W'],
    ['4', 'Stylolite Interface', '180', '0', 'W'],
    ['5', 'Striated Plane', '0', '60', 'W', '90', 'N', '', 'N'],
    ['6', 'Striated Plane', '180', '60', 'W', '90', 'S', '', 'N'],
    ['7', 'Striated Plane', '90', '45', 'N', '90', 'W', '', 'N'],
    ['8', 'Striated Plane', '270', '45', 'N', '90', 'E', '', 'N'],
    ['9', 'Striated Plane', '60', '90', 'N', '0', 'S', '', 'LL'],
    ['10', 'Striated Plane', '240', '90', 'N', '0', 'N', '', 'LL'],
    ['11', 'Striated Plane', '45', '54.7356', 'SE', '60', 'NE', '', 'N_LL'],
    ['12', 'Striated Plane', '225', '54.7356', 'S', '60', 'N', '', 'LL']
]

export const normals = [
    [Sqrt2Over2, Sqrt2Over2, 0],
    [-Sqrt2Over2, -Sqrt2Over2, 0]
    /*
    [0, 0, 1],
    [0, 0, 1],
    [-Sqrt3Over2, 0, 0.5],
    [-Sqrt3Over2, 0, 0.5],
    [0, Sqrt2Over2, Sqrt2Over2],
    [0, Sqrt2Over2, Sqrt2Over2],
    [-0.5, Sqrt3Over2, 0],
    [0.5, -Sqrt3Over2, 0],
    [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3],
    [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
]
*/

const R = 0.5

const stressTensor = [
    [-R/2, -R/2, 0],
    [-R/2, -R/2, 0],
    [0, 0, -1]
]

// n1 = normal to plane 1
const n1 = [-Sqrt2Over2, 0, Sqrt2Over2] as Vector3
// n2 = normal to plane 2
const n2 = [ - Math.cos(Math.PI/8), - Math.sin(Math.PI/8), 0] as Vector3

// nPRV = proper rotation vector perpendicular to planes 1 and 2
const nPRV = normalizedCrossProduct({ U : n1, V : n2 })
const spheriCoords = unitVectorCartesian2Spherical(nPRV) as SphericalCoords

// The rotation angle is calculated from the angle between two planes : 
// recall that axis X (horizontal) is rotated anticlockwise to axis Xh (vertical pointing upward)
// nx = unit vector normal to plane < nPRV, X >
let sX = [1, 0, 0] as Vector3
const nX = normalizedCrossProduct({ U :nPRV , V : sX })

// nXh = unit vector normal to plane < nPRV, X >
const sXh = [0, 0, 1] as Vector3
const nXh = normalizedCrossProduct({ U : nPRV, V : sXh })

// alpha = rotation angle defined as the angle between the two rotation planes
const alphaX1 = Math.acos( scalarProduct({ U : nX, V : nXh}) )

/*
const nX_ = constant_x_Vector( { k : -1, V : nX } ) // nx_ is in the opposite hemisphere
const alphaX2 = Math.acos( scalarProduct( { U : nX_, V : nXh} ) )
const alphaX = Math.min( alphaX1, alphaX2 )        // the rotation angle should be less than pi/2

// recall that axis Y (horizontal) is rotated anticlockwise to axis Yh (horizontal at pi/4)
// ny = unit vector normal to plane < nPRV, Y >
let sY = [0, 1, 0] as Vector3
const nY = normalizedCrossProduct({ U : sY, V : nPRV })

// nY = unit vector normal to plane < nPRV, Y >
const sYh = [Sqrt2Over2, Sqrt2Over2, 0] as Vector3
const nYh = normalizedCrossProduct({ U : sYh, V : nPRV })

const alphaY1 = Math.acos( scalarProduct({ U : nY, V : nYh}) )
const nY_ = constant_x_Vector( { k : -1, V : nY } ) // nY_ is in the opposite hemisphere
const alphaY2 = Math.acos( scalarProduct( { U : nY_, V : nYh} ) )
const alphaY = Math.min( alphaY1, alphaY2 )        // the rotation angle should be less than pi/2
*/

const properRotationVector = [spheriCoords.phi, spheriCoords.theta, alphaX1, R]

const rotationMatrix = {
    rot: [[0, 0, 1],
    [-Sqrt2Over2, Sqrt2Over2, 0],
    [-Sqrt2Over2, -Sqrt2Over2, 0]],
    R
}





// ----------------------------------------------------------------
//         PRIVATE : DO NOT CHANGE ANYTHING BELOW THIS LINE
// ----------------------------------------------------------------

test('anderson inverse from stress tensor', () => {
    const stress = generateStressTensorFromTensor(stressTensor as Matrix3x3) as HypotheticalSolutionTensorParameters
    doTestStress({datas, stress, msg: 'stress tensor'})
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from proper rotation vector', () => {
    const stress = generateStressTensor(properRotationVector[0], properRotationVector[1], properRotationVector[2], properRotationVector[3])
    doTestStress({stress, datas, msg: 'proper rotation vector'})
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from rotation matrix', () => {
    const stress = generateStressTensorFromHRot(rotationMatrix.rot as Matrix3x3, rotationMatrix.R)
    doTestStress({stress, datas, msg: 'Hrot'})
    expect(R).toBeCloseTo(stress.R)
})
