import { Vector3, norm2 } from "./types"

// ------------------------------------------------
export const isInProductionMode = false
// ------------------------------------------------





export function assertNormalizedVector(v: Vector3, eps = 1e-5): void {
    if (isInProductionMode === false) {
        const c = norm2(v)
        if (Math.abs(1 - c) > eps) {
            throw `vector ${v} is not normalized with eps=${eps}`
        }
    }
}

export function assertBetween(a: number, min: number, max: number) {
    if (isInProductionMode === false) {
        if (a < min || a > max) {
            throw `number a=${a} is not between [${min}, ${max}]`
        }
    }
}

export function assertCloseTo(a: number, b: number, eps = 1e-5): void {
    if (isInProductionMode === false) {
        const c = Math.abs(a - b)
        if (c > eps) {
            throw `a=${a} is not close to b=${b} with eps=${eps}`
        }
    }
}

export function assertEqual(a: number, b: number): void {
    if (isInProductionMode === false) {
        if (a !== b) {
            throw `a=${a} is not equal to b=${b}`
        }
    }
}
