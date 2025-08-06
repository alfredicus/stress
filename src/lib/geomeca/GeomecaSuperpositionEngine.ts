import { Matrix3x3, Vector3 } from "../types";
import { Engine } from "./Engine"
import { HypotheticalSolutionTensorParameters } from "./HypotheticalSolutionTensorParameters";
import { fromRotationsToTensor } from "./fromRotationsToTensor";

export class GeomecaSuperpositionEngine implements Engine {
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

    stress(p_: Vector3): HypotheticalSolutionTensorParameters {
        // Using the principle of superposition and given the n independant stress tensors at each observed point,
        // we can compute the resultant stress tensor at that point.
        // This is a placeholder implementation, as the actual superposition logic would depend on the specific
        // requirements of the geomechanical model.
        // For now, we return the hypothetical stress tensor set during initialization.
        // In a real implementation, this would involve combining multiple stress tensors based on their contributions.
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