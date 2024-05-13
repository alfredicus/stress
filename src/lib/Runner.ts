import { eigen } from "@youwol/math"
import { InverseMethod, MisfitCriteriunSolution } from "./InverseMethod"
import { Data, DataFactory } from "./data"
import { Engine } from "./geomeca"
import { SearchMethodFactory } from "./search"
import { filter } from "./filters"

/**
 * @example
 * ```js
 * const runner = new Runner()
 * 
 * runner.addData(data1)
 * runner.addData(data2)
 * ...
 * 
 * runner.setOptions({
 *      searchMethod: {
            name: "Monte Carlo",
            nbIter: 50000
        }
 * })
 *
 * const jsonSolution = runner.run()
 * console.log(jsonSolution)
 * ```
 */
export class Runner {
    inv = new InverseMethod()
    solution: MisfitCriteriunSolution = undefined

    get data(): Data[] {
        return this.inv.data
    }

    get engine(): Engine {
        return this.inv.engine
    }

    addData(buffer: string, fileExtension: string = 'json'): void {
        let jsons: any = undefined

        if (fileExtension !== 'json') {
            const fctFilter = filter.Factory.resolve(fileExtension)
            if (fctFilter) {
                jsons = fctFilter(buffer, {})
                
                if (!jsons) {
                    throw `Cannot convert your file with extension ${fileExtension} into JSON`
                }

                jsons = jsons.data
            }
        }
        else {
            jsons = JSON.parse(buffer)
        }

        jsons.forEach( json => {
            const data = DataFactory.create(json.type)
    
            if (data) {
                data.initialize(json)
                this.inv.addData(data)
            }
            else {
                throw `Unknown data type ${json.type}`
            }
        })
    }

    setOptions(options) {
        // Search method...
        {
            const json = options.searchMethod
            const search = SearchMethodFactory.create(json.name)
            if (search) {
                search.setOptions(json)
                this.inv.setSearchMethod(search)
            }
            else {
                throw `Undefined search method "${json.name}"`
            }
        }
    }

    run(): any {
        this.solution = this.inv.run()
        this.displayResults(this.solution)
        return this.generateJsonSolution(this.solution)
    }

    clear() {
        console.log('clearing the model')
        this.inv.clearData()
    }

    getMisfitAngles() {
        this.inv.engine.setHypotheticalStress(this.solution.rotationMatrixW, this.solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0]) // a position
        return this.inv.data.map(d => d.cost({ stress: s }) )
    }

    // Formate moi la solution en json...
    generateJsonSolution(solution) {
        this.inv.engine.setHypotheticalStress(solution.rotationMatrixW, solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0])

        const stress = solution.stressTensorSolution
        const eig = eigen([stress[0][0], stress[0][1], stress[0][2], stress[1][1], stress[1][2], stress[2][2]])

        const sigma1 = [eig.vectors[6], eig.vectors[7], eig.vectors[8]]
        const sigma2 = [eig.vectors[3], eig.vectors[4], eig.vectors[5]]
        const sigma3 = [eig.vectors[0], eig.vectors[1], eig.vectors[2]]

        return {
            cost: this.solution.misfit,
            stressRatio: solution.stressRatio,
            eigenVectors: {
                S1: sigma1,
                S2: sigma2,
                S3: sigma3
            },
            costs: this.getMisfitAngles() // array of misfits
        }
    }

    displayResults(solution: MisfitCriteriunSolution) {
        console.log(this.generateJsonSolution(solution))
    }
}