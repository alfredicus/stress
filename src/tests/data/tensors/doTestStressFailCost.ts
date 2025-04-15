import { Data, DataFactory, Vector3 } from "../../../lib"
import { FaultData } from "../../../lib/data/fault/FaultData"
import { FractureData } from "../../../lib/data/stress/FractureData"
import { HomogeneousEngine, HypotheticalSolutionTensorParameters } from "../../../lib/geomeca"
import { expectVector } from "../../types/expectAlgebra"

export function doTestStressFailCost(
    { datas, stress, msg = '' }:
    { datas: any[], stress: HypotheticalSolutionTensorParameters, msg?: string })
{
    const engine = new HomogeneousEngine(stress.Hrot, stress.R)

    datas.forEach( d => {
        const data = DataFactory.create(d.type) as Data

        let isPlane = false
        if (data instanceof FractureData) {
            isPlane = true
        }

        data.initialize(d)

        const normal = d.normal as Vector3

        if (data instanceof FaultData) {
            try {
                expectVector(data.normal).toBeCloseTo(normal)
            }
            catch (e) {
                console.error('Checking normal for data ' + JSON.stringify(d) + ' for test ' + msg + ' : ' + data['normal'] + ' # ' + normal)
                throw e
            }
        }

        const c = data.cost({ stress })

        try {
            expect(c).not.toBeCloseTo(0)
        }
        catch (e) {
            console.error('Checking cost for data ' + JSON.stringify(d) + ' for test ' + msg + `: cost different from zero (got ${c})!`)
            throw e
        }
    })
}
