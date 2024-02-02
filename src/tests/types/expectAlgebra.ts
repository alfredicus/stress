import { Matrix3x3, Vector3 } from "../../lib"

export function expectVector(n: Vector3): V {
    return new V(n)
}

// Allow: expectMatrix(n).toBe(m)
export function expectMatrix(n: Matrix3x3): M {
    return new M(n)
}












// --------------------------------------------
class V {
    constructor(private n: Vector3) {
    }

    toEqual(m: Vector3) {
        const n = this.n
        for (let i = 0; i < 3; ++i) {
            expect(m[i]).toEqual(n[i])
        }
    }

    toBeCloseTo(m: Vector3, numDigits = 5) {
        const n = this.n
        for (let i = 0; i < 3; ++i) {
            expect(m[i]).toBeCloseTo(n[i], numDigits)
        }
    }
}

class M {
    constructor(private n: Matrix3x3) {
    }

    toEqual(m: Matrix3x3) {
        const n = this.n
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                expect(m[i][j]).toEqual(n[i][j])
            }
        }
    }

    toBeCloseTo(m: Matrix3x3, numDigits = 5) {
        const n = this.n
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                expect(m[i][j]).toBeCloseTo(n[i][j], numDigits)
            }
        }
    }
}