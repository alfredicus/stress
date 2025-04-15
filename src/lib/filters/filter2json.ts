import { Vector3 } from "../types"
import { toFloat, toInt, trimAll } from "../utils"
import { CDirection, CStrengthAngleType, CStriationType, CTypeOfMovement, Direction, StriationType, TypeOfMovement } from "../data/fault/types"

/**
 * Usage:
 * @example
 * ```ts
 * if (filter.header.hasEntry('scale')) {
 *      const translated = filter.header.translate(name)
 *      // ...
 * }
 * 
 * const json = filter.toJson(buffer)
 * ```
 */
export namespace filter {

    export function preprocessBuffer(buffer: string): string[] {
        return buffer.split('\n').filter((value: string) => trimAll(value).length)
    }

    export namespace header {

        export function hasEntry(name: string): boolean {
            return __translate__.has(trimAll(name))
        }

        export function translate(name: string): string {
            return __translate__.get(trimAll(name))
        }

    }

    // ------------------------------------------------------------------------

    export type anyType = boolean | number | Vector3 | Direction | TypeOfMovement | StriationType

    /**
     * Return type of any filter. The json format is the input of this lib
     */
    export type JSONValue =
        | string
        | number
        | boolean
        | Vector3
        | TypeOfMovement
        | Direction
        | { [x: string]: JSONValue }
        | Array<JSONValue>

    /**
     * Transform a json tag (string) into a TypeScript object (number, string, TypeOfMovement, ...)
     */
    export function convert(tok: string, jsonName: string): anyType {
        if (__convert__.has(jsonName) === false) {
            throw `Cannot find a converter for ${jsonName}`
        }
        return __convert__.get(jsonName)(tok)
    }

    /**
     * The main filter signature to convert from any text file to a json for this library
     */
    export type toJson = (buffer: string, options: any) => JSONValue

}


// ========================= private ===========================


const __translate__: Map<string, string> = new Map()
__translate__.set('strike', 'strike')
__translate__.set('dip', 'dip')
__translate__.set('dip direction', 'dipDirection')
__translate__.set('rake', 'rake')
__translate__.set('strike direction', 'strikeDirection')
__translate__.set('striation trend', 'striationTrend')
__translate__.set('striation type', 'striationType')
__translate__.set('type of movement', 'typeOfMovement')
__translate__.set('strike bedding', 'strikeBed')
__translate__.set('dip bedding', 'dipBed')
__translate__.set('dip direction bedding', 'dipDirectionBed')
__translate__.set('line trend', 'lineTrend')
__translate__.set('line plunge', 'linePlunge')
__translate__.set('deformation phase', 'deformationPhase')
__translate__.set('relative weight', 'relativeWeight')
__translate__.set('strength angle', 'strengthAngle')
__translate__.set('minimum angle', 'minAngle')
__translate__.set('maximum angle', 'maxAngle')
__translate__.set('scale', 'scale')
__translate__.set('x', 'x')
__translate__.set('y', 'y')
__translate__.set('z', 'z')

const __convert__: Map<string, (s: string) => filter.anyType> = new Map()
__convert__.set('strike', s => toFloat(s))
__convert__.set('dip', s => toFloat(s))
__convert__.set('dipDirection', s => CDirection.fromString(s))
__convert__.set('rake', s => toFloat(s))
__convert__.set('strikeDirection', s => CDirection.fromString(s))
__convert__.set('striationTrend', s => toFloat(s))
__convert__.set('striationType', s => CStriationType.fromString(s))
__convert__.set('typeOfMovement', s => CTypeOfMovement.fromString(s))
__convert__.set('strikeBed', s => toFloat(s))
__convert__.set('dipBed', s => toFloat(s))
__convert__.set('dipDirectionBed', s => CDirection.fromString(s))
__convert__.set('lineTrend', s => toFloat(s))
__convert__.set('linePlunge', s => toFloat(s))
__convert__.set('deformationPhase', s => toInt(s))
__convert__.set('relativeWeight', s => toFloat(s))
__convert__.set('strengthAngle', s => CStrengthAngleType.fromString(s))
__convert__.set('minAngle', s => toFloat(s))
__convert__.set('maxAngle', s => toFloat(s))
__convert__.set('scale', s => toFloat(s))
__convert__.set('x', s => toFloat(s))
__convert__.set('y', s => toFloat(s))
__convert__.set('z', s => toFloat(s))