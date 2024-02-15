import { StriatedPlaneKin, Pi, HalfPi, Sqrt2Over2, Sqrt3Over2, OneOverSqrt3} from "../../lib"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../lib/geomeca/generateStressTensor"
import { printMatrix } from "../../lib/utils/print"
import { expectVector } from "../types/expectAlgebra"

test('test StriatedPlaneKin inclined bad config (45, 45, NE, 0, NE, , LL)', () => {
    const striation = new StriatedPlaneKin()
    expect(() => { //                                             *
        striation.initialize([['7', 'Striated Plane', '45', '45', 'NE', '0', 'NE', '', 'LL']])
    }).toThrowError()
})

test('test StriatedPlaneKin inclined good config (45, 45, SE, 0, SE, , LL)', () => {
    const striation = new StriatedPlaneKin()
    expect(() => {
        striation.initialize([['7', 'Striated Plane', '45', '45', 'SE', '0', 'NE', '', 'LL']])
    }).not.toThrowError()
})

test('test StriatedPlaneKin vertical (45, 45, SE, 0, NE, , LL)', () => {
    const striation = new StriatedPlaneKin()
    striation.initialize([['7', 'Striated Plane', '45', '45', 'SE', '0', 'NE', '', 'LL']])

    expectVector(striation.normal).toBeCloseTo([0.5, -0.5, Sqrt2Over2])
    expectVector(striation.striationVector).toBeCloseTo([Sqrt2Over2, Sqrt2Over2, 0])

    {
        const stress = generateStressTensorFromTensor(
            [[0, 0, 0],
            [0, -1, 0],
            [0, 0, -0.5]]
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(0, 0, HalfPi, 0.5)
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[0, 1, 0],
            [-1, 0, 0],
            [0, 0, 1]],
            0.5
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})

/*
test('test StriatedPlaneKin vertical (90, 30, S, 90, E, , I)', () => {
    const striation = new StriatedPlaneKin()
    striation.initialize([['7', 'Striated Plane', '90', '30', 'S', '90', 'E', '', 'I']])

    expectVector(striation.planeNormal).toBeCloseTo([0.5, -0.5, Sqrt2Over2])
    expectVector(striation.striationVector).toBeCloseTo([Sqrt2Over2, Sqrt2Over2, 0])

    {
        const stress = generateStressTensorFromTensor(
            [[-0.5, 0, 0],
            [0, -1, 0],
            [0, 0, 0]]
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(Pi / 4, Math.acos(OneOverSqrt3), 2 * Pi / 3, 0.5)
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[0, 1, 0],
            [0, 0, 1],
            [1, 0, 0]],
            0.5
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})
*/

test('test StriatedPlaneKin oblique (90, 30, S, 90, W, , I)', () => {
    const striation = new StriatedPlaneKin()
    striation.initialize([['7', 'Striated Plane', '90', '30', 'S', '90', 'W', '', 'I']])

    expectVector(striation.normal).toBeCloseTo([0, -0.5, Sqrt3Over2])
    expectVector(striation.striationVector).toBeCloseTo([0, Sqrt3Over2, 0.5])

    {
        const stress = generateStressTensorFromTensor(
            [[-1, 0, 0],
            [0, -0.5, 0],
            [0, 0, 0]]
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(0, HalfPi, HalfPi, 0.5)
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[1, 0, 0],
            [0, 0, 1],
            [0, -1, 0]],
            0.5
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})

test('test StriatedPlaneKin oblique (135, 54.7356103, E, 60, SE, , I_LL)', () => {
    const striation = new StriatedPlaneKin()
    striation.initialize([['7', 'Striated Plane', '135', '54.7356103', 'E', '60', 'SE', '', 'I_LL']])

    expectVector(striation.normal).toBeCloseTo([OneOverSqrt3, OneOverSqrt3, OneOverSqrt3])
    // expectVector(striation.striationVector).toBeCloseTo([Math.sqrt(2/3), 0, OneOverSqrt3])

    {
        const stress = generateStressTensorFromTensor(
            [[-1, 0, 0],
            [0, -0.5, 0],
            [0, 0, 0]]
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(0, HalfPi, HalfPi, 0.5)
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[1, 0, 0],
            [0, 0, 1],
            [0, -1, 0]],
            0.5
        )
        const c = striation.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})
 