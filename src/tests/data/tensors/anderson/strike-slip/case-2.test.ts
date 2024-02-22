import { HalfPi, Matrix3x3, OneOverSqrt3, Pi, PiOver3, PiOver4, Sqrt2Over2, Sqrt2Over4, Sqrt3Over2, Sqrt6Over4 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStress } from "../../doTestStress"

// ----------------------------------------------------------------

// Strike-slip Regime, Tensor 2

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
