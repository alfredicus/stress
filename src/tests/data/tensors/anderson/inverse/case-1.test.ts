import { HalfPi, Matrix3x3, OneOverSqrt3, Sqrt3Over2 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

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
    doTestStress({ datas, normals, stress, msg: 'stress tensor' })
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from proper rotation vector', () => {
    const stress = generateStressTensor(properRotationVector[0], properRotationVector[1], properRotationVector[2], properRotationVector[3])
    doTestStress({ stress, normals, datas, msg: 'proper rotation vector' })
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from rotation matrix', () => {
    const stress = generateStressTensorFromHRot(rotationMatrix.rot as Matrix3x3, rotationMatrix.R)
    doTestStress({ stress, normals, datas, msg: 'Hrot' })
    expect(R).toBeCloseTo(stress.R)
})