import { Engine } from "../geomeca"
import { HypotheticalSolutionTensorParameters } from "../geomeca/HypotheticalSolutionTensorParameters"
import { Matrix3x3, Point3D, Vector3 } from "../types/math"
import { isPropertyDefined, setPositionIfAny } from "../utils/assertJson"
import { DataStatus, createDataStatus } from "./DataDescription"
import { DataParameters } from "./DataParameters"

/**
 * @brief A Data represents one and only one measure
 * @category Data
 */
export abstract class Data {
    protected weight_: number = 1
    protected active_ = true
    protected pos: Point3D = [0, 0, 0]
    private jsonObject_: any = undefined
    private filename_ = ''
    private id_ = -1
    private type_ = ''

    get position(): Point3D {
        return this.pos
    }

    get weight(): number {
        return this.weight_
    }

    get filename() {
        return this.filename_
    }

    get id() {
        return this.id_
    }

    get type() {
        return this.type_
    }

    set filename(f: string) {
        this.filename_ = f
    }

    set weight(w: number) {
        this.weight_ = w
    }

    set active(a: boolean) {
        this.active = a
    }

    get active() {
        return this.active_
    }

    get objectData(): any {
        return this.jsonObject_
    }

    protected set jsonObject(o: any) {
        this.jsonObject_ = JSON.parse(JSON.stringify(o))
    }

    setOptions(options: { [key: string]: any }): boolean {
        return false
    }

    /**
     * @brief Get the number of linked data.
     * This is used to know how many data are linked to this datum.
     * For example, a fault has one linked data (the fault itself), while a stress tensor has no linked data.
     * @returns The number of linked data.
     */
    nbLinkedData(): number {
        return 1
    }

    /**
     * Replace the constructor
     */
    initialize(jsonObject: Record<string, any>): DataStatus {
        // Read weight if any
        if (isPropertyDefined(jsonObject, 'weight')) {
            this.weight_ = jsonObject['weight']
        }

        // Read active if any
        if (isPropertyDefined(jsonObject, 'active')) {
            this.active_ = jsonObject['active']
        }

        // Read id if any
        if (isPropertyDefined(jsonObject, 'id')) {
            this.id_ = jsonObject['id']
        }

        // Read type if any
        if (isPropertyDefined(jsonObject, 'type')) {
            this.type_ = jsonObject['type']
        }

        // Read position if any
        setPositionIfAny(jsonObject, this.pos)

        return createDataStatus()
    }

    __initialize__(params: DataParameters): DataStatus {
        return undefined
    }

    /**
     * @brief Check the consistency of the datum
     * @param options The options
     * @param options.displ The computed displacment vector, if any, that has to be compared with the measure of this datum
     * @param options.stress The computed stress tensor if any
     * @param options.strain The computed strain tensor if any
     */
    abstract check({ displ, strain, stress }: { displ?: Vector3, strain?: Matrix3x3, stress?: Matrix3x3 }): boolean

    /**
     * @brief Compute the cost of this datum
     * @param options The options
     * @param options.displ The computed displacment vector, if any, that has to be compared with the measure of this datum
     * @param options.stress The computed stress tensor if any
     * @param options.strain The computed strain tensor if any
     */
    abstract cost(
        { displ, strain, stress }:
            { displ?: Vector3, strain?: HypotheticalSolutionTensorParameters, stress?: HypotheticalSolutionTensorParameters }): number

    /**
     * After stress inversion, get the infered data orientation/magnitude/etc for this specific Data
     */
    abstract predict(engine: Engine, { displ, strain, stress }: { displ?: Vector3, strain?: HypotheticalSolutionTensorParameters, stress?: HypotheticalSolutionTensorParameters }): any
}
