const fs   = require('fs')
const lib = require('../../dist/@alfredicus/stress')

const integral = new lib.IntegralCurve([-1, 0, -0.5], 3.01)
fs.writeFileSync('../../../data/lines/integral_curves_1.pl', integral.getIntegral(60, 30), 'utf8', err => {})
