import { Data, DataFactory, StriatedPlaneKin, Vector3, scalarProduct } from "../../../lib"
import { FaultData } from "../../../lib/data/stress/FaultData"
import { FractureData } from "../../../lib/data/stress/FractureData"
import { StressData } from "../../../lib/data/stress/StressData"
import { HomogeneousEngine, HypotheticalSolutionTensorParameters } from "../../../lib/geomeca"
import { expectVector } from "../../types/expectAlgebra"

export function doTestStress(
    { datas, normals, stress, msg = '' }:
        { datas: string[][], normals: number[][], stress: HypotheticalSolutionTensorParameters, msg?: string }) {
    expect(datas.length === normals.length)

    const engine = new HomogeneousEngine(stress.Hrot, stress.R)

    datas.forEach((params: string[], index: number) => {
        let data = DataFactory.create(params[1]) as Data

        if (data instanceof StressData === false) {
            throw 'Data is not of type StressData'
        }

        let isPlane = false
        if (data instanceof FractureData) {
            isPlane = true
        }

        data.initialize([params])

        const normal = normals[index] as Vector3

        // Checking the normal
        // ...Introspection
        if (data instanceof FaultData) {
            try {
                expectVector(data.normal).toBeCloseTo(normal)
            }
            catch (e) {
                console.error('Checking normal for data ' + params + ' for test ' + msg + ' : ' + data['normal'] + ' # ' + normal)
                throw e
            }
        }

        const c = data.cost({ stress })

        // Checking the cost
        try {
            expect(c).toBeCloseTo(0)
        }
        catch (e) {
            console.error('Checking cost for data ' + params + ' for test ' + msg + `: cost different from zero (got ${c})!`)
            throw e
        }

        // Checking the predicted data
        try {
            const predicted = data.predict(engine, { stress })

            if (data instanceof FaultData) {
                const d = data as FaultData
                expectVector(predicted.normal).toBeCloseTo(d.normal)
                expectVector(predicted.striation).toBeCloseTo(d.striationVector)
            }
            else {
                // Here we have only one Vector3
                const dot = scalarProduct({ U: normal, V: (data as StressData).normal })
                expect(Math.abs(dot)).toBeCloseTo(1)
            }
        }
        catch (e) {
            console.error('Checking prediction for data ' + params + ' for test ' + msg + `: prediction is incorrect!`)
            throw e
        }
    })
}
