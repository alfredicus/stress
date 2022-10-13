const io   = require('@youwol/io')
const fs   = require('fs')
const lib = require('../../dist/@alfredicus/stress')

const c = new lib.Curve3D()

let buffer = ''


r = 3.01
for (let i=0; i<=100; ++i) {
    const angle = i/100*Math.PI
    const x = r*Math.cos(angle)
    const y = r*Math.sin(angle)
    c.addPoint(x, y, 0)
}
buffer += c.buffer + '\n'


fs.writeFileSync('../../../data/lines/test.pl', buffer, 'utf8', err => {})
