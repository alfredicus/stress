const io   = require('@youwol/io')
const df   = require('@youwol/dataframe')
const geom = require('@youwol/geometry')
const fs   = require('fs')

const {positions, indices} = geom.generateSphere(20)
const dataframe = df.DataFrame.create({
    series: {
        positions: df.Serie.create({array: positions, itemSize: 3}),
        indices  : df.Serie.create({array: indices  , itemSize: 3})
    }
})

fs.writeFileSync('../../../data/surface/sphere.gcd', io.encodeGocadTS(dataframe), 'utf8', err => {})