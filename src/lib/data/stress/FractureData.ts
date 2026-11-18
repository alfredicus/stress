import { Vector3 } from "../../types"
import { FractureStrategy } from "../types"
import { StressData } from "./StressData"

/**
 * @see HIERARCHY.md
 * @category Data
 */
export abstract class FractureData extends StressData {
    protected strategy: FractureStrategy = FractureStrategy.ANGLE
    setStrategy(s: FractureStrategy): void { this.strategy = s }
}
