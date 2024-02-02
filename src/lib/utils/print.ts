import { Matrix3x3 } from "../types";

export function printMatrix(m: Matrix3x3, n = 3) {
    console.log(
        m[0][0].toFixed(n), m[0][1].toFixed(n), m[0][2].toFixed(n), '\n',
        m[1][0].toFixed(n), m[1][1].toFixed(n), m[1][2].toFixed(n), '\n',
        m[2][0].toFixed(n), m[2][1].toFixed(n), m[2][2].toFixed(n)
    )
}