import { HalfPi, Matrix3x3, OneOverSqrt3, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2, Sqrt6Over4 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Strike-slip Regime, Tensor 1

const datas = [
    {
        id: 1,
        type: "Extension Fracture",
        strike: 45,
        dip: 90,
        dipDirection: '',
        normal: [-Sqrt2Over2, Sqrt2Over2, 0]
    },
    {
        id: 2,
        type: "Extension Fracture",
        strike: 225,
        dip: 90,
        dipDirection: 'SE',
        normal: [Sqrt2Over2, -Sqrt2Over2, 0]
    },
    {
        id: 3,
        type: "Stylolite Interface",
        strike: 135,
        dip: 90,
        dipDirection: 'N',
        normal: [Sqrt2Over2, Sqrt2Over2, 0]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 315,
        dip: 90,
        dipDirection: 'W',
        normal: [Sqrt2Over2, Sqrt2Over2, 0]
    },
    {
        id: 5,
        type: "Striated Plane",
        strike: 135,
        dip: 30,
        dipDirection: 'NE',
        rake: 90,
        strikeDirection: 'W',
        typeOfMovement: 'I',
        normal: [Sqrt2Over4, Sqrt2Over4, Sqrt3Over2]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 315,
        dip: 30,
        dipDirection: 'E',
        rake: 90,
        strikeDirection: 'S',
        typeOfMovement: 'I',
        normal: [Sqrt2Over4, Sqrt2Over4, Sqrt3Over2]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: 45,
        dip: 60,
        dipDirection: 'S',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [Sqrt6Over4, -Sqrt6Over4, 0.5]
    },   
    {
        id: 8,
        type: "Striated Plane",
        strike: 225,
        dip: 60,
        dipDirection: 'E',
        rake: 90,
        strikeDirection: 'W',
        typeOfMovement: 'N',
        normal: [Sqrt6Over4, -Sqrt6Over4, 0.5]
    },
    {
        id: 9,
        type: "Striated Plane",
        strike: 0,
        dip: 60,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'N',
        typeOfMovement: 'RL',
        normal: [-Sqrt3Over2, 0, 0.5]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 180,
        dip: 60,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'RL',
        normal: [-Sqrt3Over2, 0, 0.5]
    },
    {
        id: 11,
        type: "Striated Plane",
        strike: 90,
        dip: 60,
        dipDirection: 'N',
        rake: 0,
        strikeDirection: 'E',
        typeOfMovement: 'LL',
        normal: [0, Sqrt3Over2, 0.5]
    },
    {
        id: 12,
        type: "Striated Plane",
        strike: 270,
        dip: 60,
        dipDirection: 'N',
        rake: 0,
        strikeDirection: 'W',
        typeOfMovement: 'LL',
        normal: [0, Sqrt3Over2, 0.5]
    }
]

/*
export const datas = [
    ['1', 'Extension Fracture', '45', '90', ''],
    ['2', 'Extension Fracture', '225', '90', 'SE'],
    ['3', 'Stylolite Interface', '135', '90', 'N'],
    ['4', 'Stylolite Interface', '315', '90', 'W'],
    ['5', 'Striated Plane', '135', '30', 'NE', '90', 'W', '', 'I'],
    ['6', 'Striated Plane', '315', '30', 'E', '90', 'S', '', 'I'],
    ['7', 'Striated Plane', '45', '60', 'S', '90', 'N', '', 'N'],
    ['8', 'Striated Plane', '225', '60', 'E', '90', 'W', '', 'N'],
    ['9', 'Striated Plane', '0', '60', 'W', '0', 'N', '', 'RL'],
    ['10', 'Striated Plane', '180', '60', 'W', '0', 'S', '', 'RL'],
    ['11', 'Striated Plane', '90', '60', 'N', '0', 'E', '', 'LL'],
    ['11', 'Striated Plane', '270', '60', 'N', '0', 'W', '', 'LL']
]

export const normals = [

    [-Sqrt2Over2, Sqrt2Over2, 0],
    [Sqrt2Over2, -Sqrt2Over2, 0],
    [Sqrt2Over2, Sqrt2Over2, 0],
    [-Sqrt2Over2, -Sqrt2Over2, 0],
    [Sqrt2Over4, Sqrt2Over4, Sqrt3Over2, 0],
    [Sqrt2Over4, Sqrt2Over4, Sqrt3Over2, 0],
    [Sqrt2Over2 * Sqrt3Over2, - Sqrt2Over2 * Sqrt3Over2, 0.5],
    [Sqrt2Over2 * Sqrt3Over2, - Sqrt2Over2 * Sqrt3Over2, 0.5],
    [-Sqrt3Over2, 0, 0.5],
    [-Sqrt3Over2, 0, 0.5],
    [0, Sqrt3Over2, 0.5],
    [0, Sqrt3Over2, 0.5]

]
*/

const R = 0.5

const stressTensor = [
    [-0.5, -0.5, 0],
    [-0.5, -0.5, 0],
    [0, 0, -R]
]

//const properRotationVector = [PiOver4, Math.acos(OneOverSqrt3), PiOver3, R]
const properRotationVector = [0, 0, PiOver4, R]

const rotationMatrix = {
    rot: [[Sqrt2Over2, Sqrt2Over2, 0],
    [-Sqrt2Over2, Sqrt2Over2, 0],
    [0, 0, 1]],
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
