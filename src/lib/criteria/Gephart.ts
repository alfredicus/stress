import { FaultSet } from "../FaultSet"
import { Matrix3x3, newMatrix3x3, SphericalCoords, Vector3 } from "../types"
import { faultStressComponents, crossProduct, properRotationTensor, angularDifStriations,
        spherical2unitVectorCartesian, tensor_x_Vector, vectorMagnitude, normalizeVector } from "../utils"

export function misfitCriterion(
    {faultSet, rotationMatrixWrot, rotationMatrixDrot, stressRatio, maxNbFault, searchMethod=1}:
    {
        faultSet: FaultSet,
        rotationMatrixDrot: Matrix3x3,
        rotationMatrixWrot: Matrix3x3,
        stressRatio: number,
        maxNbFault?:number,
        searchMethod?: number
    }): number
{
    // The misfit between a fault observation and a stress model is defined as a rotation of the combined fault plane/slip vector  
    // that achieves an orientation for which the observed and predicted slip directions on the fault plane are aligned.
    // In other words, the rotated fault plane/slip vector coincide with the measured fault plane/slip vector.
    // The single solution which most closely matches the observation is the one associated with the smallest rotation.

    // The method supposes that the stress tensor is homogeneous and the stress ratio R is constant.
    // However, the stress tensor may involve variations in principal stress directions as well as variations in stress magnitudes (Armijo & Cisternas 78).
    // A new method can be proposed involving the variation of R as indicated forward **

    // Angular deviation (Etchecopar et al. 1981)
    const minRotAngle: number[] = []

    for (let i = 0; i < faultSet.length; i++) {

        let fault = faultSet[i]

        // Calculate the rotation angle of the striated fault for 3 simple solutions.
        // This angle is a maximum value that defines the cone around which the best solution is sought
        const RotAngle3solutions = minRotation3solutions(fault)

        switch (searchMethod) {
            case 1:
                // Sweep angular space using a circular grid
                minRotAngle[i] = gridSearchPlanes( RotAngle3solutions )
                break;
   
           case 2:
                // Sweep angular space using a Fibonacci lattice (e.g. a logarithmic spiral) 
                //minRotAngle[i] =  gridSearchPlanesFibonacciLattice( RotAngle3solutions)
                minRotAngle[i] = fibonacciLatticePlanes( RotAngle3solutions )
                break;
                    
            case 3:
                // Sweep angular space using random variables
                //minRotAngle[i] =  monteCarloSearchPlanes( RotAngle3solutions)
                minRotAngle[i] = monteCarloPlanes( RotAngle3solutions )
                break;

            default:
                console.log("No such search method exists!");
                break;
        }
    }
    if (maxNbFault === undefined) {
        return minRotAngle.reduce( (prev, cur) => prev+cur, 0 )
    }
    else {
        // The list of unisigned angular deviations is ordered increasingly (this method can be optimized using pointers in the previous for loop)
        // We only have to order the number of faults faultNumberInversion that are considered in the analysis
        return minRotAngle.sort().slice(0, maxNbFault).reduce( (prev, cur) => prev+cur, 0 )
    }
}

function gridSearchPlanes(  
    deltaGridAnglePlanes:   number,     // distance in radians between nodes in radial and circular directions definning (equal parameter as for GridSearch.ts))
    rotAngle3solutions:     number,
    STdelta:                Matrix3x3): number {
    
    // A cone with apex angle minRotAngle[i] is defined around each measured fault plane
    // Nodes in the radial and circular directions (nRadial and nCircle) are equally spaced by angle deltaGridAngle
    // note that this may lead to a slightly non-homogeneous distribution of rotation axes, yet minRotAgle is in principle low
    let nRadial = Math.floor( rotAngle3solutions / deltaGridAnglePlanes )

    let minRotAngle = rotAngle3solutions    // Initialize the minimum rotation angle

    // Spherical coords of a node located along the azimuthal great circle ot the fault plane (i.e., equal phi angle)
    let nodeAzimuthSpheriCoords: SphericalCoords
    nodeAzimuthSpheriCoords.phi = fault.SphericalCoords.phi

    // pRot = rotation tensor for grid nodes located in circles around the fault normal vectors
    let pRot:  Matrix3x3   = newMatrix3x3()

    for (let j = 1; j <= nRadial; j++) {
        // j = 0 is already considered in function minRotation3solutions (case I)

        // radialAngle = radial angle around the normal to the fault plane
        let radialAngle = j * deltaGridAnglePlanes

        // Nodes in the circular direction nCircle are also equally spaced by angle deltaGridAngle
        let nCircle = Math.floor( 2 * Math.PI * Math.sin( radialAngle ) / deltaGridAnglePlanes )
        
        // A unit vector is placed along the azimuthal great circle by increasing the colatitude by radialAngle
        nodeAzimuthSpheriCoords.theta = fault.SphericalCoords.theta + radialAngle
        let nAzimuth: Vector3
        nAzimuth = spherical2unitVectorCartesian(nodeAzimuthSpheriCoords)

        // deltaPsi = incremental rotation angle around the fault normal vector  
        let deltaPsi = 1 / j

        for (let k = 0; k <= nCircle; k++) {

            // psiRot = rotation angle 
            let psiRot = k * deltaPsi

            // pRot = rotation tensor associated to the rotation axis and rotation angle
            let pRot = properRotationTensor( fault.normal, psiRot )

            // Calculate the normal vector in system S (X,Y,Z) located in a circle around the cone axis 
            let normalNew = tensor_x_Vector(pRot, nAzimuth)

            // Calculate the rotation axis w that brings n to the position of no, where n is the unit vector normal to a potential fault plane 
            // and no is the unit vector normal to a potential fault plane
            const rotAngleFaultPlane = rotationAngleFaultPlane(normal, STdelta, normalNew)

            if ( rotAngleFaultPlane < minRotAngle ) {
                minRotAngle = rotAngleFaultPlane
            }
        }

    }
    return minRotAngle
}

function fibonacciLatticePlanes(
    nodesSpiralPlanes:   number,     // number of nodes in the logarithmic spiral definning rotation axes for the striated fault
    deltaRotAnglePlanes: number,     // rotation angle interval 
    rotAngle3solutions:  number,
    normal:              Vector3,
    STdelta:             Matrix3x3): number {

    // The optimum fault plane/slip vector is calculated by exploring the plane orientations around the measured fault plane.

    // More precisely, we analyse fault planes whose orientations are rotated around axes defined by the nodes of a Fibonacci lattice (e.g. a logarithmic spiral),
    // which are "quasi-homogeneously" distributed on the upper hemisphere of the sphere surface.
    // Several magnitudes of rotation are considered for each rotation axis, equally spaced by deltaRotAnglePlanes

    let nodesAngleInterval = Math.ceil( rotAngle3solutions / deltaRotAnglePlanes )

    let minRotAngle = RotAngle3solutions    // Initialize the minimum rotation angle
    
    let rotAxisSpheCoords: SphericalCoords

    let inc = 0

    console.log('Starting the grid search...')

    // golden ratio of the Fibonacci sequence
    let goldenAngle = ( 1 + Math.sqrt( 5 )) / 2

    let changed = false

    // pRot = rotation tensor for grid nodes located in circles around the fault normal vectors
    let pRot:  Matrix3x3   = newMatrix3x3()
    
    for (let j = 0; j <= nodesSpiralPlanes; j++ ) {
        // A log spiral is defined in the upper hemisphere, around the vertical (sigma2) axis.

        // latitude = angle in interval (0, pi/2)
        let latitude = Math.asin( 2 * j / ( 2 * nodesSpiralPlanes + 1 ))
        let longitude = 2 * Math.PI * j / goldenAngle

        // theta = colatitude in spherical coords in interval (0,PI) : theta + latitude = PI/2
        rotAxisSpheCoords.theta = Math.PI/2 - latitude
        rotAxisSpheCoords.phi   = longitude

        let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

        for (let k = - nodesAngleInterval; k <= nodesAngleInterval; k++  {
            // Negative and positive rotation angles are examined for each rotation axis

            if ( (k < 0) || (k > 0) ) {
                // The null rotation angle has already been considered in function minRotation3solutions

                // rotAngle = rotation angle around the rotation axis 
                let rotAngle  = k * deltaRotAnglePlanes

                // pRot = rotation tensor associated to the rotation axis and rotation angle
                let pRot = properRotationTensor({nRot: rotAxis, angle: rotAngle})

                // Calculate the new normal vector in system S (X,Y,Z) located inside the cone around the normal to the fault plane
                let normalNew = tensor_x_Vector({T: pRot, V: normal})

                // Calculate the rotation axis w that brings n to the position of no, where n is the unit vector normal to a potential fault plane 
                // and no is the unit vector normal to a potential fault plane
                const rotAngleFaultPlane = rotationAngleFaultPlane(normal, STdelta, normalNew)

                if ( rotAngleFaultPlane < minRotAngle ) {
                    minRotAngle = rotAngleFaultPlane
                }
            }
        }
    }
}

function monteCarloPlanes(
    // nRandomTrialsPlanes = nRandomTrials * rotAngle3solutions / ratAngleInterval ***
    nRandomTrialsPlanes:  number,     // number of random trials definning rotation axes for the striated fault
    rotAngle3solutions:   number,
    normal:               Vector3,
    STdelta:              Matrix3x3): number {

    // The optimum fault plane/slip vector is calculated by exploring the plane orientations around the measured fault plane.

    // More precisely, we analyse fault planes whose orientations are rotated around axes defined by a Montecarlo algorithm 
    // distributed "quasi-homogeneously" on the sphere surface.
    // The magnitude of rotations are also defined by a random variable calculated within a specified interval.
    
    let rotAxisSpheCoords: SphericalCoords

    let inc = 0

    console.log('Starting the grid search...')

    // pRot = rotation tensor for grid nodes located in circles around the fault normal vectors
    let pRot:  Matrix3x3   = newMatrix3x3()

    let minRotAngle = rotAngle3solutions    // Initialize the minimum rotation angle rotAngle3solutions
     
    for (let j = 0; j <= nRandomTrialsPlanes; j++) { 
        // For each trial, a rotation axis in the unit sphere is calculated from a uniform random distribution.

        // phi = random variable representing azimuth [0, 2PI)
        rotAxisSpheCoords.phi = Math.random() * 2 * Math.PI
        // theta = random variable representing the colatitude [0, PI)
        //      the arcos function ensures a uniform distribution for theta from a random value:
        rotAxisSpheCoords.theta = Math.acos( Math.random() * 2 * Math.PI)

        let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

        // We only consider positive rotation angles around each rotation axis, since the whole sphere is covered by angles (phi,theta)
        // Note that the interval for random variable rotAngle decreases during the loop as minRotAngle decreases:
        // The rotation angle for a striated fault will always be >= rotAngle 
        let rotAngle = Math.random() * minRotAngle

        // pRot = rotation tensor associated to the rotation axis and rotation angle
        let pRot = properRotationTensor({nRot: rotAxis, angle: rotAngle})

        // Calculate the new normal vector in system S (X,Y,Z) located inside the cone around the normal to the fault plane
        let normalNew = tensor_x_Vector({T: pRot, V: normal})

        // Calculate the rotation axis w that brings n to the position of no, where n is the unit vector normal to a potential fault plane 
        // and no is the unit vector normal to a potential fault plane
        const rotAngleFaultPlane = rotationAngleFaultPlane(normal, STdelta, normalNew)

        if ( rotAngleFaultPlane < minRotAngle ) {
            minRotAngle = rotAngleFaultPlane
        }

    }
    // To analyse the rotation axis for the best solution: 
    // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
    // from the components of the tensor definning a proper rotation
    // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor(DTrot) // **
}
    
function minRotation3solutions(fault): number {

    // Among all the predicted solutions for any model. three are determined easily--those which have one axis of the x' coordinates in common with the observed fault geometry.
    // Relative to the observed fault, these three solutions are characterized by: 
    // (I) a common fault pole (and therefore, fault plane) but a different slip vector and B axis (equivalent to the angular difference criteriun in the Etchecopar method)
    
    // Calculate shear stress parameters
    // Calculate the magnitude of the shear stress vector in reference system S
    const {shearStress, normalStress, shearStressMag} = faultStressComponents({stressTensor: STdelta, normal: fault.normal})
    
    // 
    let minRotation = angularDifStriations({e_striation: fault.e_striation, shearStress, shearStressMag})
    

    // (2) a common B axis but different fault pole and slip vector, and 
    // (3) a common slip vector but different fault pole and B axis.

    return minRotation
}

function rotationAngleFaultPlane( normal: Vector3, STdelta: Matrix3x3, normalNew: Vector3) : number {

    // Calculate the rotation axis w that brings 'normalNew' to the position of 'normal', where 'normalNew' is the unit vector normal to a rotated fault plane 
    // and 'normal' is the unit vector normal to the measured fault plane


    // Calculate shear stress parameters
    // Calculate the magnitude of the shear stress vector in reference system S
    const {shearStressNew, normalStressNew, shearStressNewMag} =faultStressComponents(STdelta, normalNew)

    // w = rotation vector perpendicular to great circle passing by the normals to the measured and rotated fault planes
    // The magnitude of w is the minimum rotation angle between the two planes, yet striations are not necessaily parallel under such rotation
    let w: Vector3, wn: Vector3
    w = crossProduct( normalNew, normal )
    // wn = vector w normalized
    let wMag = vectorMagnitude( w )
    wn[0] = w[0] / wMag; wn[1] = w[1] / wMag; wn[2] = w[2] / wMag
    
    // Trotw = rotation tensor associated with rotation vector w such that:
    //
    let Trotw:  Matrix3x3   = newMatrix3x3()
    Trotw = properRotationTensor(wn, wMag)

    //  = shear stress in the new plane rotated by vector w, such that the new plane coicides with the measured plane 
    let shearStressNewRot : Vector3
    shearStressNewRot = tensor_x_Vector(Trotw, shearStressNew)

    // angularDifStriae = absolute value of the angular difference between striations in the measured plane frame 
    //                      in interval (0,PI)
    // Note: this angle could be positive or negative!
    angularDifStriae = angularDifStriations(e_striation, shearStressNewRot, shearStressNewMag )

    let phi = angularDifStriae / 2
    // theta = tilt angle of the true rotation axis relative to vector w
    let theta = Math.asin( sin( phi ) / Math.sqrt( 1 - Math.cos(phi)**2 * Math.cos( wMag / 2 ) ) )
    // rotAngleFaultPlane = rotation angle along a parallel circle perpendicular to the true rotation axis
    let rotAngleFaultPlane = 2 * Math.atan( Math.tan( wMag / 2 ) / Math.cos( theta ) )

    return rotAngleFaultPlane
}
    
    // ** If the stress tensor involves variations in stress magnitudes then an additional search around the stress ratio R can be introduced.
    // This requires the definition of a weighted distance involving a rotation angle and a stress ratio deviation.
    // The stress ratio node interval englobes the stress ratio interval around the estimated value defined by the user
    // let nodesStressRatioInterval_ = Math.ceil( stressRatioInterval / deltaStressRatio )
    // for (let f = 0; f < nodesStressRatioInterval_; f++) {
    