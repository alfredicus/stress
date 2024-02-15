import { Vector3 } from "../../types"
import { StressData } from "./StressData"

/**
 * @see HIERARCHY.md
 * @category Data
 */
export abstract class FaultData extends StressData {
    protected nStriation: Vector3 = undefined

    /**
     * Measured striation in the fault plane
     */
    get striationVector() {
        return this.nStriation
    }
}
