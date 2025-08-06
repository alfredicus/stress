import { Data } from './Data'
import { CompactionBand } from './stress/CompactionBand'
import { DilationBand } from './stress/DilationBand'
import { ExtensionFracture } from './stress/ExtensionFracture'
import { NeoformedStriatedPlane } from './fault/NeoformedStriatedPlane'
import { StriatedPlaneKin } from './fault/StriatedPlane_Kin'
import { StyloliteInterface } from './stress/StyloliteInterface'

export type DataFields = {
    mandatory: string[],
    optional?: string[]
}

/* eslint @typescript-eslint/no-explicit-any: off -- need to have any here for the factory */
export namespace DataFactory {

    const map_: Map<string, any> = new Map()
    const mapFields_: Map<string, DataFields> = new Map()

    export const bind = (obj: any, name: string, fields: DataFields = { mandatory: [], optional: [] }) => {
        const className = name.length === 0 ? obj.name : name
        map_.set(className.toLowerCase(), obj)
        const mandatory = fields.mandatory.map((f: string) => f.toLowerCase())
        const optional = fields.optional ? fields.optional.map((f: string) => f.toLowerCase()) : []
        mapFields_.set(className.toLowerCase(), { mandatory, optional })
    }

    export const create = (name: string, params: any = undefined): Data => {
        const M = map_.get(name.toLowerCase())
        if (M) {
            return new M(params)
        }
        return undefined
    }

    export const exists = (name: string): boolean => {
        return map_.get(name.toLowerCase()) !== undefined
    }

    export const names = (): string[] => {
        return Array.from(map_.keys())
    }

    export const name = (data: Data): string => {
        return data.constructor.name
    }

    export const fields = (name: string): DataFields => {
        return mapFields_.get(name.toLowerCase())
    }

}

// -------------------------- BINDING DATA CLASSES ----------------------------

// Extension fractures, joints, and so forth...
{
    const fractureFields: DataFields = {
        mandatory: ['strike', 'dip'],
        optional: ['dip direction', 'deformation phase']
    }

    DataFactory.bind(ExtensionFracture, 'extension fracture', fractureFields)
    DataFactory.bind(ExtensionFracture, 'joint', fractureFields)
    DataFactory.bind(ExtensionFracture, 'dyke', fractureFields)

    DataFactory.bind(StyloliteInterface, 'stylolite interface', fractureFields)
    DataFactory.bind(CompactionBand, 'compaction band', fractureFields)
    DataFactory.bind(DilationBand, 'dilation band', fractureFields)
}

// Striation
{
    const striationFields: DataFields = {
        mandatory: ['rake','strike direction'],
        optional: ['type of movement']
    }
    const striationSubHorizontalFields: DataFields = {
        mandatory: ['striation trend'],
        optional: ['type of movement']
    }
    DataFactory.bind(StriatedPlaneKin, 'striated plane', striationFields)
    DataFactory.bind(StriatedPlaneKin, 'striated subhorizontal plane', striationSubHorizontalFields)
    DataFactory.bind(NeoformedStriatedPlane, 'neoformed striated plane', striationFields)
    DataFactory.bind(NeoformedStriatedPlane, 'neoformed subhorizontal striated plane', striationSubHorizontalFields)
}

