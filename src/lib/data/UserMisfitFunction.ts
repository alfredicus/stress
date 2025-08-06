import { Engine, HypotheticalSolutionTensorParameters } from "../geomeca";
import { Matrix3x3, Vector3 } from "../types";
import { assertPropertyDefined } from "../utils/assertJson";
import { Data } from "./Data";
import { createDataStatus, DataStatus } from "./DataDescription";


export type DisplCostFunction = (measure: Vector3, computed: Vector3) => number

/**
 * Usage using safe javascript
 * ```
 * const m = normalize(measured)
 * const c = normalize(computed)
 * return 1 - Math.abs(dot(m, c))
 * ```
 */
export class DisplUserMisfitFunction extends Data {
    private measure_: Vector3
    private fct_: DisplCostFunction

    constructor(fct: DisplCostFunction) {
        super()
        this.setCostFunction(fct)
    }

    setCostFunction(fct: DisplCostFunction) {
        this.fct_ = fct
    }

    initialize(obj: any): DataStatus {
        super.initialize(obj)

        assertPropertyDefined(obj, 'displ')
        this.measure_ = obj.displ

        return createDataStatus()
    }

    check({ displ, strain, stress }: { displ?: Vector3, strain?: Matrix3x3, stress?: Matrix3x3 }): boolean {
        return displ !== undefined
    }

    cost({ displ, strain, stress }: { displ?: Vector3, strain?: HypotheticalSolutionTensorParameters, stress: HypotheticalSolutionTensorParameters }): number {
        return this.fct_(this.measure_, displ)
    }

    predict(engine: Engine, { displ, strain, stress }: { displ?: Vector3; strain?: HypotheticalSolutionTensorParameters; stress?: HypotheticalSolutionTensorParameters }) {
        throw "TODO DisplUserMisfitFunction.predict, extend Engine and HypotheticalSolutionTensorParameters"
    }
}
