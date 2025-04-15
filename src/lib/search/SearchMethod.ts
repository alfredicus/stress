import { Data } from "../data"
import { Engine } from "../geomeca"
import { MisfitCriteriunSolution } from "../InverseMethod"
import { Sender } from "../observer"
import { Matrix3x3 } from "../types/math"

/**
 * @category Search-Method
 */
export abstract class SearchMethod extends Sender {

    abstract setOptions(json: any): void

    abstract setInteractiveSolution({ rot, stressRatio }: { rot: Matrix3x3, stressRatio: number }): void

    abstract setEngine(engine: Engine): void

    abstract getEngine(): Engine

    /**
     * 
     * @note We change the misfitCriteriaSolution variable and this is not the best solution
     * since we cannot parallelize the code
     */
    abstract run(data: Data[], misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution
}
