import { DataFactory, Vector3 } from "../../../lib"
import { HomogeneousEngine, HypotheticalSolutionTensorParameters } from "../../../lib/geomeca"
import { expectVector } from "../../types/expectAlgebra"

export function doTestStressFailCost({ datas, normals, stress, msg = '' }: { datas: string[][], normals: number[][], stress: HypotheticalSolutionTensorParameters, msg?: string }) {
    expect(datas.length === normals.length)

    const engine = new HomogeneousEngine(stress.Hrot, stress.R)

    datas.forEach((params: string[], index: number) => {
        const data = DataFactory.create(params[1])
        data.initialize([params])

        const normal = normals[index]

        // Introspection
        if (data['normal'] !== undefined) {
            try {
                expectVector(data['normal']).toBeCloseTo(normals[index] as Vector3)
            }
            catch (e) {
                console.error('Checking normal for data ' + params + ' for test ' + msg + ' : ' + data['normal'] + ' # ' + normal)
                throw e
            }
        }

        const c = data.cost({ stress })

        try {
            expect(c).not.toBeCloseTo(0)
        }
        catch (e) {
            console.error('Checking data ' + params + ' for test ' + msg + `: cost is close to zero (got ${c})!`)
            throw e
        }
    })
}
