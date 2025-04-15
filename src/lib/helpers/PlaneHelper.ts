import { createDataStatus } from "../data"
import { CDirection, Direction } from "../data/fault/types"
import { assertNumberDefined, getDirection, isPropertyDefined } from "../utils/assertJson"

export function decodePlane(obj: any) {
    assertNumberDefined(obj, 'strike')
    assertNumberDefined(obj, 'dip')
    let strike = obj.strike
    let dip = obj.dip
    let dipDirection = Direction.ERROR

    // Check consistency of the dip direction

    let dipDirIsUND = false
    let dipDirIsEmptySet = false
    let dipDirIsGeographicDir = false

    const result = createDataStatus()

    if (isPropertyDefined(obj, 'dipDirection')) {
        // The dip direction is defined 
        dipDirection = getDirection(obj, 'dipDirection')

        if (CDirection.isOk(dipDirection)) {
            // The dip direction is a valid geographic direction: 'E', 'W', 'N', 'S', 'NE', 'SE', 'SW', 'NW'
            //      i.e., strike direction is an element of set (E, W, N, S, NE, SE, SW, NW)
            dipDirIsGeographicDir = true
        }
        else if (dipDirection === Direction.UND) {
            // The dip direction is undefined (UND) 
            dipDirIsUND = true
        }
        else {
            // The dip direction is not a valid string 
            result.status = false
            result.messages.push(`Data number ${obj.id}, ${obj.type}, plane parameters: please define the dip direction from set (E, W, N, S, NE, SE, SW, NW, UND)`)
        }
    } else {
        // dip direction is not defined (i.e., empty set)
        dipDirIsEmptySet = true
    }

    if (dip > 0 && dip < 90) {
        // General case: the plane is neither horizontal nor vertical 

        if (dipDirIsEmptySet) {
            // The dip direction cannot be the empty set
            result.status = false
            result.messages.push(`Data number ${obj.id}, ${obj.type}, plane parameter: the dip direction is not the empty string; please define the dip direction from set (E, W, N, S, NE, SE, SW, NW)`)

        } else if (dipDirIsUND) {
            // The dip direction must be defined in terms of a geographic direction (i.e., it cannot be undefined - UND)
            result.status = false
            result.messages.push(`Data number ${obj.id}, ${obj.type}, plane parameter: the dip direction is not undefined (UND); please define the dip direction from set (E, W, N, S, NE, SE, SW, NW)`)

        } else if (!dipDirIsGeographicDir) {
            // In principle this else if is never reached as the geographic direction has already been checked for the dip direction parameter
            result.status = false
            result.messages.push(`Data number ${obj.id}, ${obj.type}, plane parameter: please define the dip direction  from set (E, W, N, S, NE, SE, SW, NW)`)
        }

    } else {
        if (dipDirection !== Direction.UND) {
            // For horizontal and vertical planes, the dip direction is either undefined (UND) or not defined (the empty set)
            if (!dipDirIsUND && !dipDirIsEmptySet) {
                result.status = false
                result.messages.push(`Data number ${obj.id}, ${obj.type}, plane parameter: for a horizontal plane, please set the dip direction as undefined (UND) or non defined (empty string)`)
            }
        }
    }

    if (dipDirIsEmptySet) {
        // Dip direction is not defined (i.e., empty set)
        // This value is equivalent to undefined (UND) in subsequent methods and functions (FaultHelper)
        dipDirection = Direction.UND
    }

    /*
    const r = {
        result: {
            status,
            messages
        },
        dip,
        strike,
        dipDirection
    }
    r.result.status
    r.dip
    ...
    */
    return {
        result,
        dip,
        strike,
        dipDirection
    }
}


