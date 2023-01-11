import { MisfitCriteriunSolution } from "../InverseMethod"
import { cloneMatrix3x3, Matrix3x3, newMatrix3x3, SphericalCoords } from "../types"
import { multiplyTensors, properRotationTensor, spherical2unitVectorCartesian, transposeTensor } from "../utils"
import { SearchMethod } from "./SearchMethod"

export class FibonacciLattice implements SearchMethod {
    private rotAngleHalfInterval: number
    private deltaRotAngle: number
    private nbNodesSpiral: number

    constructor(
        {rotAngleHalfInterval=0.1, deltaRotAngle=0.001, nbNodesSpiral=100}:
        {rotAngleHalfInterval?: number, deltaRotAngle?: number, nbNodesSpiral?: number} = {})
    {
        this.rotAngleHalfInterval = rotAngleHalfInterval
        this.deltaRotAngle = deltaRotAngle
        this.nbNodesSpiral = nbNodesSpiral
    }

    public run(misfitCriteriaSolution: MisfitCriteriunSolution): boolean {
        // The optimum stress tensor is calculated by exploring the stress orientations and the stress ratio around the approximate solution S0
        // obtained by the user during the interactive analysis of flow lines on the sphere, Mohr circle diagram, and histogram of signed angular deviations.
        // More precisely, the minimization function is calculated for a set of stress tensors whose orientations are rotated around axes 
        // defined by the nodes of a Fibonacci lattice (e.g. a logarithmic spiral), which are "quasi-homogeneously" distributed on the upper hemisphere of the sphere surface.
        // Several magnitudes of rotation are considered for each rotation axis.

        // The angular node interval englobes the angular interval around the estimated stress directions defined by the user
        let nodesAngleInterval = Math.ceil( this.rotAngleHalfInterval / this.deltaRotAngle )
        
        // The stress ratio node interval englobes the stress ratio interval around the estimated value defined by the user
        let nodesStressRatioInterval = Math.ceil( this.stressRatioHalfInterval / this.deltaStressRatio )

        let DTrot: Matrix3x3   = newMatrix3x3()
        let Drot:  Matrix3x3   = newMatrix3x3()
        let WTrot: Matrix3x3   = newMatrix3x3()
        let Wrot:  Matrix3x3   = newMatrix3x3()

        let rotAxisSpheCoords: SphericalCoords

        let inc = 0

        console.log('Starting the grid search...')

        // golden ratio of the Fibonacci sequence
        let goldenAngle = ( 1 + Math.sqrt( 5 )) / 2

        let changed = false
        
        for (let i = 0; i <= this.nbNodesSpiral; i++) {
            // A log spiral is defined in the upper hemisphere, around the vertical (sigma2) axis.

            // latitude = angle in interval (0, pi/2)
            let latitude = Math.asin( 2 * i / ( 2 * this.nodesSpiral + 1 ))
            let longitude = 2 * Math.PI * i / goldenAngle

            // theta = colatitude in spherical coords in interval (0,PI) : theta + latitude = PI/2
            rotAxisSpheCoords.theta = Math.PI/2 - latitude
            rotAxisSpheCoords.phi   = longitude

            let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

            for (let j = - nodesAngleInterval; j <= nodesAngleInterval; j++) {
                // Negative and positive rotation angles are examined for each rotation axis

                if ( (i === 0) || (j < 0) || (j > 0)) {
                    // The null rotation angle is only considered once (i.e. for i, j = 0)

                    // rotAngle = rotation angle around the rotation axis 
                    let rotAngle  = j * this.deltaRotAngle
                
                    // Calculate rotation tensors Drot and DTrot between systems S' and S'' such that:
                    //  V'  = DTrot V''        (DTrot is tensor Drot transposed)
                    //  V'' = Drot  V'
                    DTrot = properRotationTensor({nRot: rotAxis, angle: rotAngle})
                    Drot  = transposeTensor(DTrot)

                    // Calculate rotation tensors Wrot and WTrot between systems S and S'': WTrot = RTrot DTrot, such that:
                    //  V   = WTrot V''        (WTrot is tensor Wrot transposed)
                    //  V'' = Wrot  V
                    //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
                    //  S'' =  (X'', Y'', Z'' ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2)
                    WTrot = multiplyTensors({A: this.RTrot, B: DTrot })
                    //  Wrot = Drot Rrot
                    Wrot  = transposeTensor( WTrot )

                    for (let l = - nodesStressRatioInterval; l <= nodesStressRatioInterval; i++) {  // This for is identical to function gridsearch
                        // Stress ratio variation around R = (S2-S3)/(S1-S3)
                        let stressRatio = this.stressRatio0 + l * this.deltaStressRatio
                        if ( stressRatio >= 0 && stressRatio <= 1 ) {   // The strees ratio is in interval [0,1]

                            // Calculate the stress tensor STdelta in reference frame S from the stress tensor in reference frame S''
                            let STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

                            const misfitSum  = misfitCriteriaSolution.criterion.value(STdelta)
                            if (misfitSum < misfitCriteriaSolution.misfitSum) {
                                misfitCriteriaSolution.misfitSum      = misfitSum
                                misfitCriteriaSolution.rotationMatrixD = cloneMatrix3x3(Drot)
                                misfitCriteriaSolution.rotationMatrixW = cloneMatrix3x3(Wrot)
                                misfitCriteriaSolution.stressRatio    = stressRatio
                                changed = true
                            }

                            inc++
                        }
            
                    }                
                }
            }
        }

        return changed

        // To analyse the rotation axis for the best solution: 
        // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
        // from the components of the tensor definning a proper rotation
        // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor(DTrot) // **
    }
}
