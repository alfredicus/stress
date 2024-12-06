import { InverseMethod, MisfitCriteriunSolution } from "./InverseMethod"
import { Data, DataFactory } from "./data"
import { Engine } from "./geomeca"
import { SearchMethodFactory } from "./search"
import { filter } from "./filters"
import { eigen } from "./types"
import { EIGEN } from "./types/eigen"

const simplified = (n: number, N = 4) => parseFloat(n.toFixed(N))

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

    addDataset({ buffer, fileExtension = 'json', weight = 1, filename }: { buffer: string, fileExtension?: string, weight?: number, filename?: string }): number {
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
            else {
                throw `Cannot retrieve a filter for extension ${fileExtension}`
            }
        }
        else {
            jsons = JSON.parse(buffer)
        }

        let count = 0

        jsons.forEach(json => {
            json.active ??= true
            json.weight ??= 1

            if (json.active && json.weight > 0) {

                json.weight *= weight

                const data = DataFactory.create(json.type)

                if (data) {
                    data.initialize(json)
                    data.filename = filename // <------------------
                    this.inv.addData(data)
                    count++
                }
                else {
                    throw `Unknown data type ${json.type}`
                }
            }
        })

        return count
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
        // this.displayResults(this.solution)
        return this.generateJsonSolution(this.solution)
    }

    clear() {
        console.log('clearing the model')
        this.inv.clearData()
    }

    getMisfitAngles() {
        this.inv.engine.setHypotheticalStress(this.solution.rotationMatrixW, this.solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0]) // a position

        let filename = this.inv.data[0].filename
        const results: { filename: string, data: { cost: number, id: number, type: string }[] }[] = []

        let result: { filename: string, data: { cost: number, id: number, type: string }[] } = { filename, data: [] }
        results.push(result)

        for (let i = 0; i < this.inv.data.length; ++i) {
            const d = this.inv.data[i]
            if (d.filename !== filename) {
                results.push(result)
                filename = d.filename
                result = { filename, data: [] }
            }
            result.data.push({
                id: d.id, 
                type: d.type, 
                cost: simplified(d.cost({ stress: s }))
            })
        }

        return results
    }

    // Formate moi la solution en json...
    generateJsonSolution(solution) {
        this.inv.engine.setHypotheticalStress(solution.rotationMatrixW, solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0])

        const stress = solution.stressTensorSolution
        const eig = EIGEN([stress[0][0], stress[0][1], stress[0][2], stress[1][1], stress[1][2], stress[2][2]])

        const sigma1 = [eig.vectors[6], eig.vectors[7], eig.vectors[8]]
        const sigma2 = [eig.vectors[3], eig.vectors[4], eig.vectors[5]]
        const sigma3 = [eig.vectors[0], eig.vectors[1], eig.vectors[2]]

        return {
            cost: simplified(this.solution.misfit),
            fit: simplified((1 - this.solution.misfit) * 100, 1) + '%',
            stressRatio: simplified(solution.stressRatio),
            eigenVectors: {
                S1: sigma1,
                S2: sigma2,
                S3: sigma3
            },
            dataset: this.getMisfitAngles() // array of misfits
        }
    }

    displayResults(solution: MisfitCriteriunSolution) {
        console.log(this.generateJsonSolution(solution))
    }
}