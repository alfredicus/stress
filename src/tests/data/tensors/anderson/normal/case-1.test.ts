import { HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2, Sqrt6Over4 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Normal Regime, Tensor 1

const datas = [
    
    {
        id: 16,
        type: "Neoformed Striated Plane",
        strike: 0,
        dip: 60,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [-Sqrt3Over2, 0, 0.5],
        angleType: 'S1',
        minAngle: 30.,
        maxAngle: 30.
    }

    /*
    {
        type: "Extension Fracture",
        id: [1, 2],
        strike: [0, 180],
        dip: [90, 90],
        dipDirection: ['W', 'E'],
        normal: [[-1, 0, 0], [1, 0, 0]]
    },
    {
        id: 3,
        type: "Stylolite Interface",
        strike: 0,
        dip: 0,
        dipDirection: 'W',
        normal: [0, 0, 1]
    },
    {
        id: 4,
        type: "Stylolite Interface",
        strike: 180,
        dip: 0,
        dipDirection: 'W',
        normal: [0, 0, 1]
    },
    {
        id: [5, 6],
        type: "Striated Plane",
        strike: [0, 180],
        dip: [60, 60],
        dipDirection: ['W', 'W'],
        rake: [90, 90],
        strikeDirection: ['N', 'S'],
        typeOfMovement: ['N', 'N'],
        normal: [[-Sqrt3Over2, 0, 0.5], [-Sqrt3Over2, 0, 0.5]]
    },
    {
        id: 7,
        type: "Striated Plane",
        strike: 90,
        dip: 45,
        dipDirection: 'N',
        rake: 90,
        strikeDirection: 'W',
        typeOfMovement: 'N',
        normal: [0, Sqrt2Over2, Sqrt2Over2]
    },
    {
        id: 8,
        type: "Striated Plane",
        strike: 270,
        dip: 45,
        dipDirection: 'N',
        rake: 90,
        strikeDirection: 'E',
        typeOfMovement: 'N',
        normal: [0, Sqrt2Over2, Sqrt2Over2]
    }, 
    {
        id: 9,
        type: "Striated Plane",
        strike: 60,
        dip: 90,
        dipDirection: 'N',
        rake: 0,
        strikeDirection: 'S',
        typeOfMovement: 'LL',
        normal: [-0.5, Sqrt3Over2, 0]
    },
    {
        id: 10,
        type: "Striated Plane",
        strike: 240,
        dip: 90,
        dipDirection: 'N',
        rake: 0,
        strikeDirection: 'N',
        typeOfMovement: 'LL',
        normal: [0.5, -Sqrt3Over2, 0]
    },
    {
        id: 11,
        type: "Striated Plane",
        strike: 45,
        dip: 54.7356,
        dipDirection: 'SE',
        rake: 60,
        strikeDirection: 'NE',
        typeOfMovement: 'N_LL',
        normal: [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 12,
        type: "Striated Plane",
        strike: 225,
        dip: 54.7356,
        dipDirection: 'S',
        rake: 60,
        strikeDirection: 'N',
        typeOfMovement: 'LL',
        normal: [OneOverSqrt3, -OneOverSqrt3, OneOverSqrt3]
    },
    {
        id: 13,
        type: "Neoformed Striated Plane",
        strike: 0,
        dip: 60,
        dipDirection: 'E',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [Sqrt3Over2, 0, 0.5]
    },
    {
        id: 14,
        type: "Neoformed Striated Plane",
        strike: 0,
        dip: 60,
        dipDirection: 'W',
        rake: 90,
        strikeDirection: 'N',
        typeOfMovement: 'N',
        normal: [-Sqrt3Over2, 0, 0.5],
        angleType: 'friction',
        minAngle: 30.,
        maxAngle: 30.
    },
    */
]

const R = 0.5

const stressTensor = [
    [0, 0, 0],
    [0, -R, 0],
    [0, 0, -1]
]

const properRotationVector = [7 * PiOver4, Math.acos(OneOverSqrt3), 2 * PiOver3, R]

const rotationMatrix = {
    rot: [[0, 0, 1],
    [-1, 0, 0],
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
