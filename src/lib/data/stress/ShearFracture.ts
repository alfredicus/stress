import { Matrix3x3, Vector3 } from "../../types"
import { FractureStrategy } from "../types"
import { Engine, HypotheticalSolutionTensorParameters } from "../../geomeca"
import { DataStatus } from "../DataDescription"
import { FractureData } from "./FractureData"

export class ShearFracture extends FractureData {
    protected strategy: FractureStrategy = FractureStrategy.ANGLE

    initialize(obj: any): DataStatus {
        super.initialize(obj)
        throw 'TODO: ShearFracture.initialize'
    }

    check({ displ, strain, stress }: { displ?: Vector3, strain?: Matrix3x3, stress?: Matrix3x3 }): boolean {
        return stress !== undefined
    }

    cost({ displ, strain, stress }: { displ?: Vector3, strain?: HypotheticalSolutionTensorParameters, stress: HypotheticalSolutionTensorParameters }): number {
        throw 'TODO: ShearFracture.cost'
    }

    predict(engine: Engine, { displ, strain, stress }: { displ?: Vector3; strain?: HypotheticalSolutionTensorParameters; stress?: HypotheticalSolutionTensorParameters }) {
        throw 'TODO: ShearFracture.predict'
    }
}
