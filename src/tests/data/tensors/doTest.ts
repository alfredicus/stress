import { DataFactory, Vector3 } from "../../../lib"
import { HypotheticalSolutionTensorParameters } from "../../../lib/geomeca"
import { expectVector } from "../../types/expectAlgebra"

export function doTest({datas, normals, stress, msg=''}:{datas: string[][], normals: number[][], stress: HypotheticalSolutionTensorParameters, msg?: string}) {
    expect(datas.length === normals.length)

    datas.forEach((params: string[], index: number) => {
        const data = DataFactory.create(params[1])
        data.initialize([params])

        // Introspection
        if (data['normal'] !== undefined) {
            try {
                expectVector(data['normal']).toBeCloseTo(normals[index] as Vector3)
            }
            catch(e) {
                console.error('Checking normal for data ' + params + ' for test ' + msg + ' : ' + data['normal'] + ' # ' + normals[index])
                throw e
            }
        }

        const c = data.cost({ stress })
        try {
            expect(c).toBeCloseTo(0)
        }
        catch(e) {
            console.error('Checking data ' + params + ' for test ' + msg)
            throw e
        }
    })
}
