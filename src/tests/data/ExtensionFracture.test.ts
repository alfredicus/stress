import { ExtensionFracture, HalfPi, Sqrt2Over2 } from "../../lib"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../lib/geomeca/generateStressTensor"
import { expectVector } from "../types/expectAlgebra"

test('test ExtensionFracture inclined bad config', () => {
    const fracture = new ExtensionFracture()

    expect(() => {
        fracture.initialize([['7', 'Extension Fracture', '0', '45', 'N']]) // because E or W, and not S or N
    }).toThrowError()

    expect(() => {
        fracture.initialize([['7', 'Extension Fracture', '0', '45', 'S']]) // because E or W, and not S or N
    }).toThrowError()
})


test('test ExtensionFracture vertical (90, 90, N)', () => {
    const fracture = new ExtensionFracture()

    expect(() => {
        fracture.initialize([['7', 'Extension Fracture', '90', '90', 'N']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([0, 1, 0])

    {
        const stress = generateStressTensorFromTensor(
            [[-1, 0, 0],
            [0, 0, 0],
            [0, 0, -0.5]]
        )
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(0, 0, Math.PI, 0.5)
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]],
            0.5
        )
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})

test('test ExtensionFracture inclined (0, 45, E)', () => {
    const fracture = new ExtensionFracture()

    expect(() => {
        fracture.initialize([['7', 'Extension Fracture', '0', '45', 'E']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2])

    {
        const stress = generateStressTensorFromTensor(
            [[-0.5, 0, 0.5],
            [0, -0.5, 0],
            [0.5, 0, -0.5]]
        )
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensor(0, 3 * Math.PI / 4, HalfPi, 0.5)
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }

    {
        const stress = generateStressTensorFromHRot(
            [[0, 1, 0],
            [Sqrt2Over2, 0, Sqrt2Over2],
            [Sqrt2Over2, 0, -Sqrt2Over2]],
            0.5
        )
        const c = fracture.cost({ stress })
        expect(c).toBeCloseTo(0)
    }
})
