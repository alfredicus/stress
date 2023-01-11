import { MisfitCriteriunSolution } from "../InverseMethod"
import { cloneMatrix3x3, Matrix3x3, newMatrix3x3, SphericalCoords } from "../types"
import { multiplyTensors, properRotationTensor, spherical2unitVectorCartesian, transposeTensor } from "../utils"
import { SearchMethod } from "./SearchMethod"

export class MonteCarlo implements SearchMethod {
    private rotAngleHalfInterval: number
    private nbRandomTrials: number

    constructor(
        {rotAngleHalfInterval=0.1, nbRandomTrials=100}:
        {rotAngleHalfInterval?: number, nbRandomTrials?: number} = {})
    {
        this.rotAngleHalfInterval = rotAngleHalfInterval
        this.nbRandomTrials= nbRandomTrials
    }

    public run(misfitCriteriaSolution: MisfitCriteriunSolution): boolean {
        // The optimum stress tensor is calculated by exploring the stress orientations and the stress ratio around the approximate solution S0
        // obtained by the user during the interactive analysis of flow lines on the sphere, Mohr circle diagram, and histogram of signed angular deviations.
        // More precisely, the minimization function is calculated for a set of stress tensors whose orientations are rotated around axes 
        // defined by a Montecarlo algorithm distributed "quasi-homogeneously" on the sphere surface.
        // The magnitude of rotations and the stress ratio are also defined by random variables calculated within specified intervals.
        
        // Stress ratio variation stressRatioHalfInterval around R = (S2-S3)/(S1-S3), is constrained to interval [0,1]
        let stressRatioMin = Math.max(0, this.stressRatio0 - this.stressRatioHalfInterval )
        let stressRatioMax = Math.min(1, this.stressRatio0 + this.stressRatioHalfInterval )

        let stressRatioEffectiveInterval = stressRatioMax - stressRatioMin
           
        let DTrot: Matrix3x3   = newMatrix3x3()
        let Drot:  Matrix3x3   = newMatrix3x3()
        let WTrot: Matrix3x3   = newMatrix3x3()
        let Wrot:  Matrix3x3   = newMatrix3x3()

        let rotAxisSpheCoords: SphericalCoords

        let inc = 0

        console.log('Starting the grid search...')

        let changed = false

        for (let i = 0; i <= this.nbRandomTrials; i++) {
            // For each trial, a rotation axis in the unit sphere is calculated from a uniform random distribution.

            // phi = random variable representing azimuth [0, 2PI)
            rotAxisSpheCoords.phi = Math.random() * 2 * Math.PI
            // theta = random variable representing the colatitude [0, PI)
            //      the arcos function ensures a uniform distribution for theta from a random value:
            rotAxisSpheCoords.theta = Math.acos( Math.random() * 2 * Math.PI)

            let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

            // We only consider positive rotation angles around each rotation axis, since the whole sphere is covered by angles (phi,theta)
            let rotAngle = Math.random() * this.rotAngleHalfInterval
                
            // Calculate rotation tensors Drot and DTrot between systems S' and S'' such that:
            //  V'  = DTrot V''        (DTrot is tensor Drot transposed)
            //  V'' = Drot  V'
            DTrot = properRotationTensor(rotAxis, rotAngle)
            Drot  = transposeTensor(DTrot)
            // Calculate rotation tensors Wrot and WTrot between systems S and S'': WTrot = RTrot DTrot, such that:
            //  V   = WTrot V''        (WTrot is tensor Wrot transposed)
            //  V'' = Wrot  V
            //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
            //  S'' =  (X'', Y'', Z'' ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2)
            WTrot = multiplyTensors({A: this.RTrot, B: DTrot })
            //  Wrot = Drot Rrot
            Wrot  = transposeTensor( WTrot )

            // Stress ratio variation around R = (S2-S3)/(S1-S3)
            let stressRatio = stressRatioMin + Math.random() * stressRatioEffectiveInterval // The strees ratio is in interval [0,1]
            // Calculate the stress tensor STdelta in reference frame S from the stress tensor in reference frame S''
            let STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

            // Stress ratio variation around R = (S2-S3)/(S1-S3)
            let stressRatio = stressRatioMin + Math.random() * stressRatioEffectiveInterval // The strees ratio is in interval [0,1]
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
        return changed
            
    }            
    // To analyse the rotation axis for the best solution: 
    // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
    // from the components of the tensor definning a proper rotation
    // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor(DTrot) // **    
}
         
   


private monteCarloSearch() {
        // The optimum stress tensor is calculated by exploring the stress orientations and the stress ratio around the approximate solution S0
        // obtained by the user during the interactive analysis of flow lines on the sphere, Mohr circle diagram, and histogram of signed angular deviations.
        // More precisely, the minimization function is calculated for a set of stress tensors whose orientations are rotated around axes 
        // defined by a Montecarlo algorithm distributed "quasi-homogeneously" on the sphere surface.
        // The magnitude of rotations and the stress ratio are also defined by random variables calculated within specified intervals.

        // Stress ratio variation stressRatioHalfInterval around R = (S2-S3)/(S1-S3), is constrained to interval [0,1]
        let stressRatioMin = Math.max(0, this.stressRatio0 - this.stressRatioHalfInterval )
        let stressRatioMax = Math.min(1, this.stressRatio0 + this.stressRatioHalfInterval )

        let stressRatioEffectiveInterval = stressRatioMax - stressRatioMin
         
        let DTrot: Matrix3x3   = newMatrix3x3()
        let Drot:  Matrix3x3   = newMatrix3x3()
        let WTrot: Matrix3x3   = newMatrix3x3()
        let Wrot:  Matrix3x3   = newMatrix3x3()

        let rotAxisSpheCoords: SphericalCoords 

        let inc = 0

        console.log('Starting the grid search...')
        
        for (let i = 0; i <= this.nRandomTrials; i++) {
            // For each trial, a rotation axis in the unit sphere is calculated from a uniform random distribution.

            // phi = random variable representing azimuth [0, 2PI)
            rotAxisSpheCoords.phi = Math.random() * 2 * Math.PI
            // theta = random variable representing the colatitude [0, PI)
            //      the arcos function ensures a uniform distribution for theta from a random value:
            rotAxisSpheCoords.theta = Math.acos( Math.random() * 2 * Math.PI)

            let rotAxis = spherical2unitVectorCartesian(rotAxisSpheCoords)

            // We only consider positive rotation angles around each rotation axis, since the whole sphere is covered by angles (phi,theta)
            let rotAngle = Math.random() * this.rotAngleHalfInterval
                
            // Calculate rotation tensors Drot and DTrot between systems S' and S'' such that:
            //  V'  = DTrot V''        (DTrot is tensor Drot transposed)
            //  V'' = Drot  V'
            DTrot = properRotationTensor(rotAxis, rotAngle)
            Drot  = transposeTensor(DTrot)
            // Calculate rotation tensors Wrot and WTrot between systems S and S'': WTrot = RTrot DT, such that:
            //  V   = WTrot V''        (WTrot is tensor Wrot transposed)
            //  V'' = Wrot  V
            //  S   =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
            //  S'' =  (X'', Y'', Z'' ) is the principal reference frame for a fixed node in the search grid (sigma_1, sigma_3, sigma_2)
            WTrot = multiplyTensors({A: this.RTrot, B: DTrot })
            Wrot  = transposeTensor( WTrot )

            // Stress ratio variation around R = (S2-S3)/(S1-S3)
            let stressRatio = stressRatioMin + Math.random() * stressRatioEffectiveInterval // The strees ratio is in interval [0,1]
            // Calculate the stress tensor STdelta in reference frame S from the stress tensor in reference frame S''
            let STdelta = stressTensorDelta(stressRatio, Wrot, WTrot)

            this.misfitCriteriaSolution.forEach( bestSolution => {
                const misfitSum  = bestSolution.criterion({
                    rotationMatrixDrot: Drot,
                    rotationMatrixWrot: Wrot,
                    stressRatio: stressRatio,
                    faultSet: this.faultSet
                }) // number
                if (misfitSum < bestSolution.misfitSum) {
                    bestSolution.misfitSum      = misfitSum
                    bestSolution.rotationMatrixDrot = cloneMatrix3x3(Drot)
                    bestSolution.rotationMatrixWrot = cloneMatrix3x3(Wrot)
                    bestSolution.stressRatio    = stressRatio
                    console.log('cur solution:', [i,j,k,l])
                }
            })

            // if (inc%100 === 0) {
                // console.log(inc, [i,j,k,l])
                console.log(inc, rotAxisSpheCoords)
            // }

            inc++
        }
        // To analyse the rotation axis for the best solution: 
        // The cartesian and spherical coords of a unit vector corresponding to the rotation axis are determined 
        // from the components of the tensor definning a proper rotation
        // let {rotAxis, rotAxisSpheCoords, rotMag} = rotationParamsFromRotTensor(DTrot) // **
    }

