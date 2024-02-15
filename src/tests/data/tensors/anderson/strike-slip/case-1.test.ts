import { HalfPi, Matrix3x3, OneOverSqrt3, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

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
    doTestStress({datas, normals, stress, msg: 'stress tensor'})
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from proper rotation vector', () => {
    const stress = generateStressTensor(properRotationVector[0], properRotationVector[1], properRotationVector[2], properRotationVector[3])
    doTestStress({stress, normals, datas, msg: 'proper rotation vector'})
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from rotation matrix', () => {
    const stress = generateStressTensorFromHRot(rotationMatrix.rot as Matrix3x3, rotationMatrix.R)
    doTestStress({stress, normals, datas, msg: 'Hrot'})
    expect(R).toBeCloseTo(stress.R)
})
