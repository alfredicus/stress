import { HalfPi, Matrix3x3 } from "../../../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../../../lib/geomeca"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../../../../lib/geomeca/generateStressTensor"
import { doTestStressFailCost } from "../../doTestStressFailCost"

// ----------------------------------------------------------------

export const datas = [
    ['1', 'Striated Plane', '0', '90', 'E', '60', 'N', '', 'LL']
]

export const normals = [
    [-1, 0, 0]
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
    doTestStressFailCost({ datas, normals, stress, msg: 'stress tensor' })
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from proper rotation vector', () => {
    const stress = generateStressTensor(properRotationVector[0], properRotationVector[1], properRotationVector[2], properRotationVector[3])
    doTestStressFailCost({ stress, normals, datas, msg: 'proper rotation vector' })
    expect(R).toBeCloseTo(stress.R)
})

test('anderson inverse from rotation matrix', () => {
    const stress = generateStressTensorFromHRot(rotationMatrix.rot as Matrix3x3, rotationMatrix.R)
    doTestStressFailCost({ stress, normals, datas, msg: 'Hrot' })
    expect(R).toBeCloseTo(stress.R)
})
