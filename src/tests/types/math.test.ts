


import { Matrix3x3, Vector3, cloneMatrix3x3, 
    normalizeVector, tensor_x_Vector, vectorMagnitude, constant_x_Vector,
    crossProduct, multiplyTensors, add_Vectors, scalarProduct,
    scalarProductUnitVectors, normalizedCrossProduct
} from "../../lib"
import { expectMatrix, expectVector } from "./expectAlgebra"

test('test matrices clone(copy)', () => {
    {
        const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] as Matrix3x3
        const n = cloneMatrix3x3(m)
        expectMatrix(n).toEqual(m)

        m[1][2] = -9
        expect(n[1][2]).toEqual(6)
    }
})

test('test matrices reference', () => {
    {
        const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] as Matrix3x3
        const n = m
        expectMatrix(n).toEqual(m)

        m[1][2] = -9
        expect(n[1][2]).toEqual(-9)
    }
})

test('test matrices tensor x vector', () => {
    {
        const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] as Matrix3x3
        const v = [2, 3, 4] as Vector3
        const r = tensor_x_Vector({ T: m, V: v })
        expectVector(r).toEqual([20, 47, 74])
    }
})

test('test matrices mult tensors', () => {
    {
        const A = [[1, 2, -1], [3, 2, 0], [-4, 0, 2]] as Matrix3x3
        const B = [[3, 4, 2], [0, 1, 0], [-2, 0, 1]] as Matrix3x3
        const C = multiplyTensors({ A, B })
        expectMatrix(C).toEqual([[5,6,1], [9,14,6], [-16,-16,-6]])
    }
})

test('Vector operations cross product', () => {

    // Cross Product
    {
        const U = [1, 0, 0] as Vector3
        const V = [0, 1, 0] as Vector3
        const r = crossProduct({ U, V })
        expectVector(r).toEqual([0, 0, 1])
    }
})

test('Vector operation cross product bis', () => {
    {
        const U = [0.6, 0.8, 0] as Vector3
        const V = [0, 0, 1] as Vector3
        const r = crossProduct({ U, V })
        expectVector(r).toEqual([0.8, -0.6, 0])
    }
})

test('Vector operations cross product ter', () => {
    {
        const U = [0.6, 0.8, 0] as Vector3
        const V = [0, 0, 1] as Vector3
        const r = crossProduct({ U, V })
        expectVector(r).toEqual([0.8, -0.6, 0])
    }
})

test('Vector operations normalizedCrossProduct', () => {
    {
        const U = [2, 0, 0] as Vector3
        const V = [0, 3, 0] as Vector3
        const r = normalizedCrossProduct({ U, V })
        expectVector(r).toEqual([0, 0, 1])
    }
})

test('Vector operations scalarProduct', () => {
    // Scalar product
    {
        // perpendicular vectors
        const U = [3, 4, 6] as Vector3
        const V = [-3, -4, 25/6] as Vector3
        const r = scalarProduct({ U, V })
        expect(r).toEqual(0)
    }
})

test('Vector operations scalarProduct oblic vectors', () => {
    {
        // oblique unit vectors making an angle of PI/3
        let phi = Math.PI/4
        let teta = Math.PI/6
        const U = [Math.sin(teta) * Math.cos(phi), Math.sin(teta) * Math.sin(phi), Math.cos(teta)] as Vector3
        const V = [Math.cos(phi), Math.sin(phi), 0] as Vector3
        const r = scalarProduct({ U, V })
        // cos(PI/3) = 0.5
        expect(r).toBeCloseTo(0.5)
    }
})

test('Vector operations scalarProduct oblic unit vector', () => {
    {
        // scalar product unit vectors: this routine constrains the scalar product to interval [-1,1]

        // We suppose that U and V are unit vectors (this condition is not checked)
        let phi = Math.PI/4
        let teta = Math.PI/6
        let k = 1 + 1e-7
        const V = [Math.sin(teta) * Math.cos(phi), Math.sin(teta) * Math.sin(phi), Math.cos(teta)] as Vector3
        // Vector V is not normalized
        const U = constant_x_Vector({k,V})

        const r = scalarProductUnitVectors({ U, V })
        expect(r).toEqual(1)
    }
})

test('Vector operations add vectors', () => {
    // Vector addition
    {
        const U = [5, 6, 7] as Vector3
        const V = [8, 9, 10] as Vector3
        const r = add_Vectors({ U, V })
        expectVector(r).toEqual([13, 15, 17])
    }
})

// test('Vector operations', () => {
//     // normal vector
//     {
//         // The definition of the normal vector in terms of the angles 
//         // phi and théta in spherical coords semms to be inverted!
//         // This function is not called in any other function
//         let phi = Math.PI/4
//         let theta = Math.PI/2
//         // const r = normalVector({phi, theta})
//         // let nx = 1/Math.sqrt(2)
//         // expectVector(r).toBeCloseTo([nx, nx, 0])
//     }
// })



// test('Vector operations', () => {
//     {
//         let phi = Math.PI/4
//         let nx = 1/Math.sqrt(3)
//         let theta = Math.acos(nx)
//         // const r = normalVector({phi, theta})
//         // expectVector(r).toBeCloseTo([nx, nx, nx])
//     }
// })





test('test vectors normalizeVector', () => {
    {
        const a = [1, 0, 0] as Vector3

        let b = normalizeVector(a)
        expectVector(b).toEqual([1, 0, 0])
        expectVector(b).toEqual(a)

        b = normalizeVector(a, 10)
        expectVector(b).toEqual([0.1, 0, 0])
    }
})

test('test vectors normalizeVector 2', () => {
    {
        const a = [3, 4, 0] as Vector3

        expect(vectorMagnitude(a)).toBeCloseTo(5)
        let b = normalizeVector(a)
        expectVector(b).toEqual([3 / 5, 4 / 5, 0])

        b = normalizeVector(a, 10)
        expectVector(b).toEqual([3 / 10, 4 / 10, 0])
    }
})

test('test vectors constant_x_Vector', () => {
    {
        const V = [3, 4, 5] as Vector3
        let k = 5
        const r = constant_x_Vector({k,V})

        expectVector(r).toBeCloseTo([15, 20, 25])
    }
})
