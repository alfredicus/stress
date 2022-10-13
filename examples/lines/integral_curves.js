const io   = require('@youwol/io')
const fs   = require('fs')
const lib = require('../../dist/@alfredicus/stress')

const c = new lib.Curve3D()

// Plot integral curves for a given symmetrical tensor (stress or strain)

let buffer = ''
let r = 3.01
let k1 = 1
let lamba_x = -1
let lamba_y = 0
let lamba_z = -0.5
let exp_sin = ( lamba_x - lamba_z ) / ( lamba_y - lamba_x )
let exp_cos = ( lamba_z - lamba_y ) / ( lamba_y - lamba_x )

for (let i=1; i<=89; ++i) {
    // phi = azimuthal angle in polar coords.
    const phi = Math.PI * i/180
    // theta = polar angle in polar coords defined as a function of phi
    const theta = Math.atan( k1 * Math.sin(phi)**exp_sin * Math.cos(phi)**exp_cos )
    // transformation from spherical to cartesian coords.
    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi)
    const z = r * Math.cos(theta)
    c.addPoint(x, y, z)
}
buffer += c.buffer + '\n'

// Modifying the constant k1 changes the integral curve
k1 = 0.5

for (let i=1; i<=89; ++i) {
 
    const phi = Math.PI * i/180
    const theta = Math.atan( k1 * Math.sin(phi)**exp_sin * Math.cos(phi)**exp_cos )
    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi)
    const z = r * Math.cos(theta)
    c.addPoint(x, y, z)
}
buffer += c.buffer + '\n'

// Define a tangent plane by fixing angles phi and theta in spherical coordinates
// phi = 30°
let phi_1 = Math.PI * 30 /180
// theta = 60°
let theta_1 = Math.PI * 85 /180
// Determine integral curve that passes by this point of the sphere surface, by calculating k1
// k1 is defined as a function of phi and theta for a specific symmetrical tensor
k1 = Math.tan(theta_1) / ( Math.sin(phi_1)**exp_sin * Math.cos(phi_1)**exp_cos )

// Plot the integral curve that passes by this specific point
for (let i=1; i<=89; ++i) {
 
    const phi = Math.PI * i/180
    const theta = Math.atan( k1 * Math.sin(phi)**exp_sin * Math.cos(phi)**exp_cos )
    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi)
    const z = r * Math.cos(theta)
    c.addPoint(x, y, z)
}
buffer += c.buffer + '\n'




fs.writeFileSync('../../../data/lines/integral_curves.pl', buffer, 'utf8', err => {})
