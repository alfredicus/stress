import { FaultSet } from "../FaultSet"
import { Matrix3x3 } from "../types"

export abstract class MisfitCriteriun {
    protected faultSet: FaultSet
    protected maxNbFault:number
    
    constructor({faultSet, maxNbFault}:{faultSet: FaultSet, maxNbFault?:number}) {
        this.faultSet = faultSet
        this.maxNbFault = maxNbFault
    }

    // stressTensorDelta is the old STdelta
    abstract value(stressTensorDelta: Matrix3x3): number
}
