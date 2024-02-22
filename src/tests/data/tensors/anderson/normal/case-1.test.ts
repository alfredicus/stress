import { HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2, Sqrt6Over4 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Normal Regime, Tensor 1

export const datas = [
    ['1', 'Extension Fracture', '0', '90', 'W'],
    ['2', 'Extension Fracture', '180', '90', 'E'],
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
    [-1, 0, 0],
    [1, 0, 0],
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
