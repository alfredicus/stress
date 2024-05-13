const stress = require('../dist/@alfredo-taboada/stress')
const fs = require('fs')

function getBaseName(filename) {
    return filename.substring(0, filename.lastIndexOf('.'))
}

function filter(filename) {
    const buffer = fs.readFileSync(filename, 'utf8')
    const json = stress.csv2json(buffer)
    fs.writeFileSync(getBaseName(filename) + '.json', JSON.stringify(json))
}

filter('./stylos.csv')
filter('./joints.csv')
