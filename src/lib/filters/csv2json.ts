import { DataFactory } from "../data"
import { toInt, trimAll } from "../utils"
import { filter } from "./filter2json"

/**
 * @example
 * ```ts
 * const json = csv2json(buffer) // by default, separator is ';'
 * const json = csv2json(buffer, {separator: ','})
 * ```
 */
export const csv2json: filter.toJson = (buffer: string, {separator = ';'}:{separator?: string}={}): filter.JSONValue => {
    const result = {
        comment: "from csv file",
        header: "",
        data: []
    }

    const lines = filter.preprocessBuffer( buffer )

    // Read the header
    // ---------------
    // Example:
    //      line = 'id;Type;Strike;dip;Dip DirecTion;...'
    // will give:
    //      toks = ['id', 'type', 'strike', 'dip', 'dip direction', ...]
    const header = lines[0]

    result.header = header.trim()

    let toksHeader = header.trim().split(separator).map (tok => tok.toLowerCase() )
    const id = trimAll(toksHeader[0]).toLowerCase()
    const type = trimAll(toksHeader[1]).toLowerCase()
    if (id !== 'id') {
        throw `In CSV file header, first mandatory field 'id' is not corectly defined. Got '${id}'`
    }

    if (type !== 'type') {
        throw `In CSV file header, second mandatory field 'type' is not corectly defined. Got '${type}'`
    }

    toksHeader.shift()
    toksHeader.shift()
    toksHeader = toksHeader.map( tok => trimAll(tok) )
    toksHeader.forEach( (name, index) => {
        // const nname = trimAll(name)
        if (filter.header.hasEntry(name.trim()) === false) {
            throw `Entry '${name.trim()}' in CSV header is not defined (header = '${header}')`
        }
    })

    // Read the data themself
    for (let i = 1; i < lines.length; ++i) {
        const line = trimAll(lines[i].trim())
        if (line.length === 0) {
            continue
        }

        let toks = line.split(separator).map(s => s.replace(',', '.'))
        if (toks.length === 0) {
            continue
        }

        // Example:
        //      line = '5;Striated Plane;50;70;E;;;N;;...'
        // will give:
        //      toks = ['5', 'striated plane', '50', '70', 'E', '', '', 'N', '', ...]
        
        toks = toks.map(tok => trimAll(tok))

        const id = toInt(toks[0])
        const type = toks[1].toLowerCase()

        if (DataFactory.exists(type) === false) {
            throw `Unknown data type "${toks[1]}" for data id ${toks[0]}.
    Possible values are: ${DataFactory.names().reduce( (prev, cur) => prev.length===0 ? cur : prev+', '+cur, '')} // cond ? true : false
    Original buffer: ${buffer}`
        }

        const data = {
            id,
            type
        }

        toks.shift() // id
        toks.shift() // type

        toks.forEach( (tok, index) => {
            if (tok.length !== 0) {
                const csvName = toksHeader[index]
                const jsonName = filter.header.translate(csvName)
                // boolean, number, string, Vector3
                // Example: data.dip = '30'
                data[jsonName] = filter.convert(tok, jsonName)
            }
        })

        result.data.push(data)
    }

    return result
}
