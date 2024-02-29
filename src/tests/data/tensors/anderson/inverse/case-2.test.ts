import { HalfPi, Matrix3x3, OneOverSqrt3, PiOver3, PiOver4, Sqrt2Over2, Sqrt3Over2 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Inverse Regime, Tensor 2

const datas = [
    {
        id: 1,
        type: "Extension Fracture",
        strike: 0,
        dip: 0,
        dipDirection: 'E',
        normal: [0, 0, 1]
    },
    {
        id: 2,
        type: "Extension Fracture",
        strike: 180,
        dip: 0,
        dipDirection: 'E',
        normal: [0, 0, 1]
    },
    {
        id: 3,
        type: "Stylolite Interface",
        strike: 90,
        dip: 90,
        dipDirection: '',
        normal: [0, 1, 0]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 270,
        dip: 90,
        dipDirection: 'N',
        normal: [0, -1, 0]
    },
    {
        id: 5,
        type: "Striated Plane",
        strike: 90,
        dip: 30,
        dipDirection: 'S',
        rake: 90,
        strikeDirection: 'W',
        typeOfMovement: 'I',
        normal: [0, -0.5, Sqrt3Over2]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 270,
        dip: 30,
        dipDirection: 'S',
        rake: 90,
        strikeDirection: 'E',
        typeOfMovement: 'I',
        normal: [0, -0.5, Sqrt3Over2]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: 150,
        dip: 90,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'E',
        typeOfMovement: 'RL',
        normal: [Sqrt3Over2, 0.5, 0]
    },
    {
        id: 8,
        type: "Striated Plane",
        strike: 330,
        dip: 90,
        dipDirection: 'S',
        rake: 0,
        strikeDirection: 'N',
        typeOfMovement: 'RL',
        normal: [-Sqrt3Over2, -0.5, 0]
    },
    {
        id: 9,
        type: "Striated Plane",
        strike: 45,
        dip: 54.7356,
        dipDirection: 'W',
        rake: 60,
        strikeDirection: 'NE',
        typeOfMovement: 'LL',
        normal: [-OneOverSqrt3, OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 225,
        dip: 54.7356,
        dipDirection: 'NW',
        rake: 60,
        strikeDirection: 'E',
        typeOfMovement: 'I',
        normal: [-OneOverSqrt3, OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 11,
        type: "Striated Plane",
        strike: 45,
        dip: 54.7356,
        dipDirection: 'E',
        rake: 60,
        strikeDirection: 'SW',
        typeOfMovement: 'I',
        normal: [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 12,
        type: "Striated Plane",
        strike: 225,
        dip: 54.7356,
        dipDirection: 'SE',
        rake: 60,
        strikeDirection: 'W',
        typeOfMovement: 'I_LL',
        normal: [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    }
]

/*

export const datas = [
    ['1', 'Extension Fracture', '0', '0', 'E'],
    ['2', 'Extension Fracture', '180', '0', 'E'],
    ['3', 'Stylolite Interface', '90', '90', ''],
    ['4', 'Stylolite Interface', '270', '90', 'N'],
    ['5', 'Striated Plane', '90', '30', 'S', '90', 'W', '', 'I'],
    ['6', 'Striated Plane', '270', '30', 'S', '90', 'E', '', 'I'],
    ['7', 'Striated Plane', '150', '90', 'W', '0', 'E', '', 'RL'],
    ['8', 'Striated Plane', '330', '90', 'S', '0', 'N', '', 'RL'],
    ['9', 'Striated Plane', '45', '54.7356', 'W', '60', 'NE', '', 'LL'],
    ['10', 'Striated Plane', '225', '54.7356', 'NW', '60', 'E', '', 'I'],
    ['11', 'Striated Plane', '45', '54.7356', 'E', '60', 'SW', '', 'I'],
    ['12', 'Striated Plane', '225', '54.7356', 'SE', '60', 'W', '', 'I_LL']
]

export const normals = [
    [0, 0, 1],
    [0, 0, 1],
    [0, 1, 0],
    [0, -1, 0],
    [0, -0.5, Sqrt3Over2],
    [0, -0.5, Sqrt3Over2],
    [Sqrt3Over2, 0.5, 0],
    [-Sqrt3Over2,- 0.5, 0],
    [-OneOverSqrt3, OneOverSqrt3, OneOverSqrt3],
    [-OneOverSqrt3, OneOverSqrt3, OneOverSqrt3],
    [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3],
    [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]

]

*/

const R = 0.5

const stressTensor = [
    [-R, 0, 0],
    [0, -1, 0],
    [0, 0, 0]
]

//const properRotationVector = [PiOver4, Math.acos(OneOverSqrt3), PiOver3, R]
const properRotationVector = [PiOver4, Math.acos(OneOverSqrt3), 2 * PiOver3, R]

const rotationMatrix = {
    rot: [[0, 1, 0],
    [0, 0, 1],
    [1, 0, 0]],
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
