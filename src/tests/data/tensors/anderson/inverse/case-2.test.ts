import { HalfPi, Matrix3x3, OneOverSqrt3, PiOver3, PiOver4, Sqrt2Over2, Sqrt3Over2 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Inverse Regime, Tensor 2

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
