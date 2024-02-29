import { HalfPi, Matrix3x3, OneOverSqrt3, Sqrt3Over2 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Inverse Regime, Tensor 1

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
        strike: 0,
        dip: 90,
        dipDirection: '',
        normal: [-1, 0, 0]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 180,
        dip: 90,
        dipDirection: 'W',
        normal: [1, 0, 0]
    },
    {
        id: 5,
        type: "Striated Plane",
        strike: 0,
        dip: 30,
        dipDirection: 'E',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'I',
        normal: [0.5, 0, Sqrt3Over2]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 180,
        dip: 30,
        dipDirection: 'E',
        rake: 90,
        strikeDirection: 'S',
        typeOfMovement: 'I',
        normal: [0.5, 0, Sqrt3Over2]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: 60,
        dip: 90,
        dipDirection: 'S',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'RL',
        normal: [-0.5, Sqrt3Over2, 0]
    },
    {
        id: 8,
        type: "Striated Plane",
        strike: 240,
        dip: 90,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'N',
        typeOfMovement: 'RL',
        normal: [0.5, -Sqrt3Over2, 0]
    },
    {
        id: 9,
        type: "Striated Plane",
        strike: 135,
        dip: 54.7356,
        dipDirection: 'W',
        rake: 60,
        strikeDirection: 'W',
        typeOfMovement: 'LL',
        normal: [-OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 315,
        dip: 54.7356,
        dipDirection: 'S',
        rake: 60,
        strikeDirection: 'N',
        typeOfMovement: 'I_LL',
        normal: [-OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    }


]

/*
export const datas = [
    ['1', 'Extension Fracture', '0', '0', 'E'],
    ['2', 'Extension Fracture', '180', '0', 'E'],
    ['3', 'Stylolite Interface', '0', '90', ''],
    ['4', 'Stylolite Interface', '180', '90', 'W'],
    ['5', 'Striated Plane', '0', '30', 'E', '90', 'N', '', 'I'],
    ['6', 'Striated Plane', '180', '30', 'E', '90', 'S', '', 'I'],
    ['7', 'Striated Plane', '60', '90', 'S', '0', 'S', '', 'RL'],
    ['8', 'Striated Plane', '240', '90', 'W', '0', 'N', '', 'RL'],
    ['9', 'Striated Plane', '135', '54.7356', 'W', '60', 'W', '', 'LL'],
    ['10', 'Striated Plane', '315', '54.7356', 'S', '60', 'N', '', 'I_LL']
]

export const normals = [
    [0, 0, 1],
    [0, 0, 1],
    [-1, 0, 0],
    [1, 0, 0],
    [0.5, 0, Sqrt3Over2],
    [0.5, 0, Sqrt3Over2],
    [-0.5, Sqrt3Over2, 0],
    [0.5, -Sqrt3Over2, 0],
    [-OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3],
    [-OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
]
*/

const R = 0.5

const stressTensor = [
    [-1, 0, 0],
    [0, -R, 0],
    [0, 0, 0]
]

const properRotationVector = [0, HalfPi, HalfPi, R]

const rotationMatrix = {
    rot: [[1, 0, 0],
    [0, 0, 1],
    [0, -1, 0]],
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


