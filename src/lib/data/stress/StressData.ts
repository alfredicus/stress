import { Vector3 } from "../../types"
import { Data } from "../Data"

/**
 * @see HIERARCHY.md
 * @category Data
 */
export abstract class StressData extends Data {
    protected nPlane: Vector3 = undefined

    get normal() {
        return this.nPlane
    }
}
