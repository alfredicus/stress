import { StyloliteInterface, HalfPi, Sqrt2Over2, Pi } from "../../lib"
import { generateStressTensor, generateStressTensorFromHRot, generateStressTensorFromTensor } from "../../lib/geomeca/generateStressTensor"
import { printMatrix } from "../../lib/utils/print"
import { expectVector } from "../types/expectAlgebra"

test('test StyloliteInterface inclined bad config', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '0', '45', 'N']]) // because E or W, and not S or N
    }).toThrowError()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '0', '45', 'S']]) // because E or W, and not S or N
    }).toThrowError()
})

// ==================================================================

test('test StyloliteInterface vertical (90, 90, N) from stress tensor', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '90', '90', 'N']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([0, 1, 0])

    const stress = generateStressTensorFromTensor(
        [[0, 0, 0],
        [0, -1, 0],
        [-0.5, 0, 0]]
    )
    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})

test('test StyloliteInterface vertical (90, 90, N) from proper rotation matrix', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '90', '90', 'N']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([0, 1, 0])

    const stress = generateStressTensor(0, 0, Math.PI / 2, 0.5)
    // console.log(stress)
    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})

test('test StyloliteInterface vertical (90, 90, N) from principal stress orientations', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '90', '90', 'N']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([0, 1, 0])

    const stress = generateStressTensorFromHRot(
        [[0, 1, 0],
        [-1, 0, 0],
        [0, 0, 1]],
        0.5
    )
    // console.log(stress)
    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})

// ==================================================================

test('test StyloliteInterface inclined (0, 45, E) from stress tensor', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '0', '45', 'E']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2])

    const stress = generateStressTensorFromTensor(
        [[-Sqrt2Over2, 0, -Sqrt2Over2],
        [0, -0.5, 0],
        [Sqrt2Over2, 0, -Sqrt2Over2]]
    )
    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})

test('test StyloliteInterface inclined (0, 45, E) from proper rotation matrix', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '0', '45', 'E']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2])

    const stress = generateStressTensor(Pi/2, Pi/2, 3*Pi/4, 0.5)
    // printMatrix(stress.S)

    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})

test('test StyloliteInterface inclined (0, 45, E) from principal stress orientations', () => {
    const fracture = new StyloliteInterface()

    expect(() => {
        fracture.initialize([['7', 'Stylolite Interface', '0', '45', 'E']])
    }).not.toThrow()

    expectVector(fracture.normal).toBeCloseTo([Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2])

    const stress = generateStressTensorFromHRot(
        [[Sqrt2Over2, 0, Sqrt2Over2],
        [0, 1, 0],
        [-Sqrt2Over2, 0, Sqrt2Over2]],
        0.5
    )
    // printMatrix(stress.S)

    const c = fracture.cost({ stress })
    expect(c).toBeCloseTo(0)
})
