
export class Curve3D {
    private points: Array<number> = []

    addPoint(x: number, y: number, z: number = 0) {
        this.points.push(x,y,z)
    }

    clear() {
        this.points = []
    }

    get buffer(): string {
        let s = `GOCAD PLine 1.0
        HEADER {
            name: curve3d
        }
        PROPERTIES rake
        `

        const nbPoints = this.points.length/3
        let index = 0
        
        for (let i=0; i<this.points.length; i+=3) {
            const attr = 0
            s += 'PVRTX ' + index+' ' + this.points[i] + ' ' + this.points[i+1] + ' ' + this.points[i+2] + ' ' + attr + '\n'
            index++
        }

        for (let i=0; i<nbPoints-1; ++i) {
            s += 'SEG '+i+' '+(i+1) +'\n'
        }
        s += 'END'

        return s
    }
}
