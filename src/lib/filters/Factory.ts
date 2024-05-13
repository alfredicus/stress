import { csv2json } from './csv2json'
import { filter as F } from './filter2json' 

export namespace filter {

    /**
     * Usage:
     * @example
     * ```ts
     *  function alfredoFilter(buffer: string): JSONValue {
     *      // ...
     *      return json
     *  }
     * 
     *  filter.Factory.bind(alfredoFilter, 'alfredo')
        
        // --------------- Using

        const json = filter.Factory.convert('alfredo', buffer, {separator: ';'})

        const csv = filter.Factory.resolve('csv')
        if (csv) {
            const json = csv(buffer, {separator: ';'})
        }

        console.log(filter.Factory.exists('txt'))
        console.log(filter.Factory.exists('csv'))
        console.log(filter.Factory.exists('alfredo'))
        console.log(filter.Factory.names())
     * ```
     */
    export namespace Factory {

        const map_: Map<string, F.toJson> = new Map()

        export const bind = (converter: F.toJson, name: string = '') => {
            name.length === 0 ? map_.set(converter.name, converter) : map_.set(name, converter)
        }

        export const convert = (converterName: string, buffer: string, options: any = undefined): F.JSONValue => {
            const fct = map_.get(converterName)
            if (fct) {
                return fct(buffer, options)
            }
            return undefined
        }

        export function resolve(converterName: string): F.toJson {
            return map_.get(converterName)
        }

        export const exists = (converterName: string): boolean => {
            return map_.get(converterName) !== undefined
        }

        export const names = (): string[] => {
            return Array.from(map_.keys())
        }

    }

}

// ----------------------------------------------

filter.Factory.bind(csv2json, 'csv')
