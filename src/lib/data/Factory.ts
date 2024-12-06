import { Data } from './Data'
import { CompactionBand } from './stress/CompactionBand'
import { DilationBand } from './stress/DilationBand'
import { ExtensionFracture } from './stress/ExtensionFracture'
import { NeoformedStriatedPlane } from './stress/NeoformedStriatedPlane'
import { StriatedPlaneKin } from './stress/StriatedPlane_Kin'
import { StyloliteInterface } from './stress/StyloliteInterface'

/* eslint @typescript-eslint/no-explicit-any: off -- need to have any here for the factory */
export namespace DataFactory {

    const map_: Map<string, any> = new Map()

    export const bind = (obj: any, name: string = '') => {
        const className = name.length === 0 ? obj.name : name
        map_.set(className.toLowerCase(), obj)
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

}

// Fault planes
DataFactory.bind(StriatedPlaneKin, 'striated plane')
DataFactory.bind(NeoformedStriatedPlane, 'neoformed striated plane')

// Extensional fractures and dilation bands
DataFactory.bind(DilationBand, 'dilation band')
DataFactory.bind(ExtensionFracture, 'extension fracture')

// Compresional interfaces and compaction bands
DataFactory.bind(CompactionBand, 'compaction band')
DataFactory.bind(StyloliteInterface, 'stylolite interface')

// DataFactory.bind(StriatedPlaneFriction1, 'Striated Plane Friction1')
// DataFactory.bind(StriatedPlaneFriction2, 'Striated Plane Friction2')

// Striated shear bands
// DataFactory.bind(StriatedDilatantShearBand, 'Striated Dilatant Shear Band')
// DataFactory.bind(StriatedCompactionalShearBand, 'Striated Compactional Shear Band')

// Conjugate fault planes and deformation bands
// DataFactory.bind(ConjugateFaults, 'Conjugate Faults 1')
// DataFactory.bind(ConjugateFaults, 'Conjugate Faults 2')
// DataFactory.bind(ConjugateCompactionalShearBands, 'Conjugate Compactional Shear Bands 1')
// DataFactory.bind(ConjugateCompactionalShearBands, 'Conjugate Compactional Shear Bands 2')
// DataFactory.bind(ConjugateDilatantShearBands, 'Conjugate Dilatant Shear Bands 1')
// DataFactory.bind(ConjugateDilatantShearBands, 'Conjugate Dilatant Shear Bands 2')


