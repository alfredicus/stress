import { Point3D } from "../types"
import { CDirection, CTypeOfMovement, Direction, TypeOfMovement } from "../data/fault/types"

export function assertPropertyDefined(jsonObject: any, property: string) {
    if (jsonObject[property] === undefined) {
        throw `Property ${property} in json object is not defined.
With object: ${jsonObject}`
    }
}

export function assertNumberDefined(jsonObject: any, property: string) {
    if (jsonObject[property] === undefined) {
        throw `Property ${property} in json object is not defined.
With object: ${jsonObject}`
    }
    if (typeof jsonObject[property] !== "number") {
        throw `Property ${property} in json object is defined but is not a number.
With object: ${jsonObject}`
    }
}

export function isPropertyDefined(jsonObject: any, property: string): boolean {
    return jsonObject[property] !== undefined
}

export function isNumberDefined(jsonObject: any, property: string): boolean {
    return jsonObject[property] !== undefined && typeof jsonObject[property] === "number"
}

export function isStringDefined(jsonObject: any, property: string): boolean {
    return jsonObject[property] !== undefined && typeof jsonObject[property] === "string"
}

export function isDirectionDefined(jsonObject: any, property: string): boolean {
    if (jsonObject[property] === undefined) return false
    if (typeof jsonObject[property] !== "string") return false

    if (CDirection.fromString(jsonObject[property]) === Direction.UND) {
        return false
    }
    return true
}

export function getDirection(jsonObject: any, property: string): Direction {
    if (!isDirectionDefined(jsonObject, property)) {
        return Direction.UND
    }
    return CDirection.fromString(jsonObject[property])
}

export function isTypeOfMovementDefined(jsonObject: any, property: string): boolean {
    if (jsonObject[property] === undefined) return false
    if (typeof jsonObject[property] !== "string") return false

    if (CTypeOfMovement.fromString(jsonObject[property]) === TypeOfMovement.ERROR) {
        return false
    }
    return true
}

export function getTypeOfMovement(jsonObject: any, property: string): TypeOfMovement {
    if (!isTypeOfMovementDefined(jsonObject, property)) {
        return TypeOfMovement.ERROR
    }
    return CTypeOfMovement.fromString(jsonObject[property])
}

export function setPositionIfAny(obj: any, p: Point3D): void {
    if (isPropertyDefined(obj, 'position') === false) {
        return
    }

    if (Array.isArray(obj.position) === false) {
        throw `position is not an array!
For object:
${JSON.stringify(obj)}`
        return
    }

    const array = obj.position as number[]

    if (array.length ==2 || array.length === 3) {
        p[0] = array[0]
        p[1] = array[1]
        if (array.length === 3) {
            p[2] = array[2]
        }
    }
    else {
        throw `position is not of length 2 or 3 (get ${array.length})`
    }
}