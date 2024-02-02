import { StriatedPlaneKin, HalfPi, Sqrt2Over2 } from "../../lib"
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

    expectVector(striation.planeNormal).toBeCloseTo([0.5, -0.5, Sqrt2Over2])
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
