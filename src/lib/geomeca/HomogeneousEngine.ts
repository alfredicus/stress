import { Matrix3x3, Vector3 } from "../types";
import { Engine } from "./Engine"
import { HypotheticalSolutionTensorParameters } from "./HypotheticalSolutionTensorParameters";
import { fromRotationsToTensor } from "./fromRotationsToTensor";

export class HomogeneousEngine implements Engine {
    private hst_ = new HypotheticalSolutionTensorParameters()
    private stressRatio_: number = undefined

    constructor(Hrot?: Matrix3x3, stressRatio?: number) {
        if (Hrot != undefined && stressRatio !== undefined) {
            this.setHypotheticalStress(Hrot, stressRatio)
        }
    }

    setHypotheticalStress(Hrot: Matrix3x3, stressRatio: number): void {
        this.hst_ = fromRotationsToTensor(Hrot, stressRatio)
        this.stressRatio_ = stressRatio
    }

    stress(p: Vector3): HypotheticalSolutionTensorParameters {
        return this.hst_
    }

    Hrot(): Matrix3x3 {
        return this.hst_.Hrot
    }

    stressRatio(): number {
        return this.stressRatio_
    }

    R(): number { // same as stressRatio()
        return this.stressRatio_
    }

    S(): Matrix3x3 {
        return this.hst_.S
    }

}