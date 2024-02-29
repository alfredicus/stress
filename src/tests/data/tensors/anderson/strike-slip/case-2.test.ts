import { HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2, Sqrt6Over4 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Strike-slip Regime, Tensor 2

const datas = [
    {
        id: 1,
        type: "Extension Fracture",
        strike: 0,
        dip: 90,
        dipDirection: 'E',
        normal: [-1, 0, 0]
    },
    {
        id: 2,
        type: "Extension Fracture",
        strike: 180,
        dip: 90,
        dipDirection: 'W',
        normal: [1, 0, 0]
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
        strike: 150,
        dip: 90,
        dipDirection: 'NE',
        rake: 0,
        strikeDirection: 'NW',
        typeOfMovement: 'RL',
        normal: [Sqrt3Over2, 0.5, 0]
    },
    {
        id: 6,
        type: "Striated Plane",
        strike: 330,
        dip: 90,
        dipDirection: 'SW',
        rake: 0,
        strikeDirection: 'N',
        typeOfMovement: 'RL',
        normal: [-Sqrt3Over2, -0.5, 0]
    },
    {
        id: 7,
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
        id: 8,
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
        id: 9,
        type: "Striated Plane",
        strike: 0,
        dip: 60,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [-Sqrt3Over2, 0, 0.5]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 180,
        dip: 60,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'S',
        typeOfMovement: 'N',
        normal: [-Sqrt3Over2, 0, 0.5]
    },
    {
        id: 11,
        type: "Striated Plane",
        strike: 135,
        dip: 60,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'NW',
        typeOfMovement: 'RL',
        normal: [-Sqrt6Over4, -Sqrt6Over4, 0.5]
    },
    {
        id: 12,
        type: "Striated Plane",
        strike: 315,
        dip: 60,
        dipDirection: 'W',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'RL',
        normal: [-Sqrt6Over4, -Sqrt6Over4, 0.5]
    },
    {
        id: 13,
        type: "Striated Plane",
        strike: 45,
        dip: 30,
        dipDirection: 'SE',
        rake: 0,
        strikeDirection: 'NE',
        typeOfMovement: 'LL',
        normal: [Sqrt2Over4,-Sqrt2Over4, Sqrt3Over2]
    },
    {
        id: 14,
        type: "Striated Plane",
        strike: 225,
        dip: 30,
        dipDirection: 'S',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'LL',
        normal: [Sqrt2Over4,-Sqrt2Over4, Sqrt3Over2]
    }
]

/*
export const datas = [
    ['1', 'Extension Fracture', '0', '90', 'E'],
    ['2', 'Extension Fracture', '180', '90', 'W'],
    ['3', 'Stylolite Interface', '90', '90', ''],
    ['4', 'Stylolite Interface', '270', '90', 'N'],
    ['5', 'Striated Plane', '150', '90', 'NE', '0', 'NW', '', 'RL'],
    ['6', 'Striated Plane', '330', '90', 'SW', '0', 'N', '', 'RL'],
    ['7', 'Striated Plane', '90', '30', 'S', '90', 'W', '', 'I'],
    ['8', 'Striated Plane', '270', '30', 'S', '90', 'E', '', 'I'],
    ['9', 'Striated Plane', '0', '60', 'W', '90', 'N', '', 'N'],
    ['10', 'Striated Plane', '180', '60', 'W', '90', 'S', '', 'N'],
    ['11', 'Striated Plane', '135', '60', 'W', '0', 'NW', '', 'RL'],
    ['12', 'Striated Plane', '315', '60', 'W', '0', 'S', '', 'RL'],
    ['13', 'Striated Plane', '45', '30', 'SE', '0', 'NE', '', 'LL'],
    ['14', 'Striated Plane', '225', '30', 'S', '0', 'S', '', 'LL']

]

export const normals = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [Sqrt3Over2, 0.5, 0],
    [-Sqrt3Over2, -0.5, 0],
    [0, -0.5, Sqrt3Over2],
    [0, -0.5, Sqrt3Over2],
    [-Sqrt3Over2, 0, 0.5],
    [-Sqrt3Over2, 0, 0.5],
    [-Sqrt6Over4, -Sqrt6Over4, 0.5],
    [-Sqrt6Over4, -Sqrt6Over4, 0.5],
    [Sqrt2Over4,-Sqrt2Over4, Sqrt3Over2],
    [Sqrt2Over4,-Sqrt2Over4, Sqrt3Over2]
]
*/

const R = 0.5

const stressTensor = [
    [0, 0, 0],
    [0, -1, 0],
    [0, 0, -R]
]

const properRotationVector = [PiOver4, HalfPi, Pi, R]

const rotationMatrix = {
    rot: [[0, 1, 0],
    [1, 0, 0],
    [0, 0, -1]],
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
