import { MisfitCriteriun } from "../criteria"
import { cloneMisfitCriteriunSolution, MisfitCriteriunSolution } from "../InverseMethod"
import { cloneMatrix3x3, Matrix3x3, newMatrix3x3, newMatrix3x3Identity } from "../types"
import { multiplyTensors, rotationParamsFromRotTensor, transposeTensor } from "../utils"
import { SearchMethod } from "./SearchMethod"
import { stressTensorDelta } from "./utils"


export class GridSearch implements SearchMethod {
    private deltaGridAngle = 1
    private GridAngleHalfIntervalS = 1
    private stressRatioHalfInterval = 1
    private deltaStressRatio = 1
    private Rrot: Matrix3x3 = newMatrix3x3Identity()
    private stressRatio0 = 0.5

    constructor(
        {}:
        {} = {})
    {
    }

    setInteractiveSolution({rot, stressRatio}:{rot: Matrix3x3, stressRatio: number}): void {
        this.Rrot = rot
        this.stressRatio0 = stressRatio
    }

    /**
     * Example:
     * ```ts
     * const searchMethod = new GridSearch() 
     * searchMethod.setInteractiveSolution({Rrot: rot, stressRatio: 0.5})
     * 
     * const criterion = new Etchecopar({faultSet, maxNbFault: 100})
     * 
     * const initSolution = createDefaultSolution(criterion)
     * 
     * for (let i=0; i<100; ++i) {
     *      const solution = searchMethod.run(initSolution)
     * }
     * ``` 
     */
    run(misfitCriteriaSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
        // The optimum stress tensor is calculated by exploring the stress orientations and the stress ratio around the approximate solution S0
        // obtained by the user during the interactive analysis of flow lines on the sphere, Mohr circle diagram, and histogram of signed angular deviations.
        // More precisely, the minimization function is calculated in the nodes of a four-dimmensional grid that sweeps the area around S0

        // The angular node interval englobes the angular interval around the estimated stress directions defined by the user
        let nodesAngleInterval = Math.ceil( this.GridAngleHalfIntervalS / this.deltaGridAngle )
        // The stress ratio node interval englobes the stress ratio interval around the estimated value defined by the user
        let nodesStressRatioInterval = Math.ceil( this.stressRatioHalfInterval / this.deltaStressRatio )
 
        let DTrot: Matrix3x3   = newMatrix3x3()
        let Drot:  Matrix3x3   = newMatrix3x3()
        let WTrot: Matrix3x3   = newMatrix3x3()
        let Wrot:  Matrix3x3   = newMatrix3x3()

        let inc = 0

        const newSolution = cloneMisfitCriteriunSolution(misfitCriteriaSolution)

        for (let i = - nodesAngleInterval; i <= nodesAngleInterval; i++) {
            // Angular variation around axis X': ROLL
            let deltaPhi = i * this.deltaGridAngle
            let cosDeltaPhi = Math.cos(deltaPhi)
            let sinDeltaPhi = Math.sin(deltaPhi)
            for (let j = - nodesAngleInterval; j <= nodesAngleInterval; j++) {
                // Angular variation around axis Y': PITCH
                let deltaTheta = j * this.deltaGridAngle
                let cosDeltaTheta = Math.cos(deltaTheta)
                let sinDeltaTheta = Math.sin(deltaTheta)
                for (let k = - nodesAngleInterval; k <= nodesAngleInterval; k++) {
                    // Angular variation around axis Z': YAW
                    const deltaAlpha = k * this.deltaGridAngle
                    let cosDeltaAlpha = Math.cos(deltaAlpha)
                    let sinDeltaAlpha = Math.sin(deltaAlpha)

                    // Calculate rotation tensors Drot and DTrot between systems S' and S'' such that:
                    //  V'  = DTrot V''        (DTrot is tensor Drot transposed)
                    //  V'' = Drot  V'
                    DTrot = rotationTensorDT(cosDeltaPhi,sinDeltaPhi,cosDeltaTheta,sinDeltaTheta,cosDeltaAlpha,sinDeltaAlpha)
                    Drot  = transposeTensor(DTrot)

                    // To analyse the distribution of rotation axes in space: (these instructions can be deleted once the analysis is done)
                    // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
                    // from the components of the tensor definning a proper rotation
                    // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor({rotTensor: DTrot}) // **

                    // Calculate rotation tensors Wrot and WTrot between systems S and S'': WTrot = RTrot DTrot, such that:
                    //  V   = WTrot V''        (WTrot is tensor Wrot transposed)
                    //  V'' = Wrot  V
                    //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
                    //  S'' =  (X'', Y'', Z'' ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2)
                    WTrot = multiplyTensors({A: transposeTensor(this.Rrot), B: DTrot })
                    //  Wrot = Drot Rrot
                    Wrot  = transposeTensor( WTrot )

                    for (let l = - nodesStressRatioInterval; l <= nodesStressRatioInterval; i++) {
                        // Stress ratio variation around R = (S2-S3)/(S1-S3)
                        let stressRatio = this.stressRatio0 + l * this.deltaStressRatio
                        if ( stressRatio >= 0 && stressRatio <= 1 ) {   // The strees ratio is in interval [0,1]

                            // Calculate the stress tensor STdelta in reference frame S from the stress tensor in reference frame S''
                            let STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

                            const misfitSum  = newSolution.criterion.value(STdelta)
                            if (misfitSum < newSolution.misfitSum) {
                                newSolution.misfitSum = misfitSum
                                newSolution.rotationMatrixD = cloneMatrix3x3(Drot)
                                newSolution.rotationMatrixW = cloneMatrix3x3(Wrot)
                                newSolution.stressRatio = stressRatio
                            }

                            inc++
                        }
            
                    }                
                }
            }
        }

        return newSolution

        // To analyse the rotation axis for the best solution: 
        // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
        // from the components of the tensor definning a proper rotation
        // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor(DTrot) // **
    }
}

// --------------- Hidden to users

function rotationTensorDT(cosDeltaPhi: number, sinDeltaPhi : number, cosDeltaTheta : number,sinDeltaTheta : number,
    cosDeltaAlpha : number, sinDeltaAlpha: number ): Matrix3x3
{
    // Calculate the rotation tensor DT between reference frame S' and S'', such that:
    //  V'  = DT V''        (DT is tensor D transposed)
    //  V'' = D  V'
    //  S' = (X',Y',Z') is the principal stress reference frame obtained by the user from the interactive analysis, parallel to (sigma_1, sigma_3, sigma_2);
    //  S'' =  (X'', Y'', Z'' ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2)

    // The columns of matrix D are given by the unit vectors parallel to X1'', X2'', and X3'' defined in reference system S':

    const DT: Matrix3x3 = newMatrix3x3()

    // Sigma_1 axis: Unit vector e1''
    DT[0][0] =   cosDeltaPhi * cosDeltaTheta
    DT[1][0] =   sinDeltaPhi * cosDeltaTheta
    DT[2][0] = - sinDeltaTheta

    // Sigma_3 axis: Unit vector e2''
    DT[0][1] = - sinDeltaPhi * cosDeltaAlpha + cosDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[1][1] =   cosDeltaPhi * cosDeltaAlpha + sinDeltaPhi * sinDeltaTheta * sinDeltaAlpha
    DT[2][1] =   cosDeltaTheta * sinDeltaAlpha

    // Sigma_2 axis: Unit vector e3''
    DT[0][2] =   sinDeltaPhi * sinDeltaAlpha + cosDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[1][2] = - cosDeltaPhi * sinDeltaAlpha + sinDeltaPhi * sinDeltaTheta * cosDeltaAlpha
    DT[2][2] =   cosDeltaTheta * cosDeltaAlpha

    return DT
}