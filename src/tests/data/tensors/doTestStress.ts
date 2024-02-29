import { Data, DataFactory, Vector3, scalarProduct } from "../../../lib"
import { FaultData } from "../../../lib/data/stress/FaultData"
import { FractureData } from "../../../lib/data/stress/FractureData"
import { StressData } from "../../../lib/data/stress/StressData"
import { Engine, HomogeneousEngine, HypotheticalSolutionTensorParameters } from "../../../lib/geomeca"
import { expectVector } from "../../types/expectAlgebra"

export function doTestStress(
    { datas, stress, msg = '' } :
        { datas: any[], stress: HypotheticalSolutionTensorParameters, msg?: string }) {

    const engine = new HomogeneousEngine(stress.Hrot, stress.R)

    datas.forEach(params => {

        // ========================================================================
        // d can be either an object representing a unique data or an array of data
        // of a certain type
        // ========================================================================
        if (Array.isArray(params.id)) {
            const n = params.id.length
            for (let i=0; i<n; ++i) {
                const d = {}
                for (let prop in params) {
                    if (Array.isArray(params[prop])) {
                        if ( params[prop].length !== n) {
                            console.error(`array length of property ${prop} (${params[prop].length}) does not match length of id (${n})`)
                            throw `error`
                        }
                        d[prop] = params[prop][i]
                    }
                }
                d['type'] = params['type']
                processOneData({d, stress, msg})
            }
        }
        else {
            processOneData({d: params, stress, msg})
        }
    })
}

function processOneData(
    { d, stress, msg = '' }:
    { d: any, stress: HypotheticalSolutionTensorParameters, msg?: string })
{
    const engine = new HomogeneousEngine(stress.Hrot, stress.R)

    // Building d with params
    let data = DataFactory.create(d.type) as Data

    if (data instanceof StressData === false) {
        throw 'Data is not of type StressData'
    }

    let isPlane = false
    if (data instanceof FractureData) {
        isPlane = true
    }

    data.initialize(d)

    const normal = d.normal as Vector3

    // Checking the normal
    // ...Introspection
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

    // Checking the cost
    try {
        expect(c).toBeCloseTo(0)
    }
    catch (e) {
        console.error('Checking cost for data ' + JSON.stringify(d) + ' for test ' + msg + `: cost different from zero (got ${c})!`)
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
        console.error('Checking prediction for data ' + JSON.stringify(d) + ' for test ' + msg + `: prediction is incorrect!`)
        throw e
    }

    // console.log(`test for id=${d.id} passed`)
}
