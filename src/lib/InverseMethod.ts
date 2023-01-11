import { MisfitCriteriun } from "./criteria"
import { FaultSet } from "./FaultSet"
import { GridSearch } from "./search/GridSearch"
import { SearchMethod } from "./search/SearchMethod"
import { cloneMatrix3x3, Matrix3x3, newMatrix3x3, Vector3 } from "./types"

import { 
    deg2rad, 
    transposeTensor, 
    angularDifStriations, 
    multiplyTensors, 
    stressTensorPrincipalAxes, 
    faultStressComponents, 
    properRotationTensor, 
    spherical2unitVectorCartesian
} from "./utils"

// export type FirstNodeOfGrid = [boolean, boolean]

// export type MisfitCriteriun = (
//     {
//         faultSet, 
//         coords, 
//         rotationMatrix, 
//         stressRatio, 
//         maxNbFault
//     }:
//     {
//         faultSet: FaultSet,
//         coords: [number, number, number, number],
//         rotationMatrix: Matrix3x3,
//         stressRatio: number,
//         maxNbFault?:number
//     }) => number

export type MisfitCriteriunSolution = {
    criterion: MisfitCriteriun,
    misfitSum: number,
    rotationMatrixW: Matrix3x3,
    rotationMatrixD: Matrix3x3,
    stressRatio: number
}

export function cloneMisfitCriteriunSolution(misfitCriteriunSolution: MisfitCriteriunSolution): MisfitCriteriunSolution {
    return {
        criterion: misfitCriteriunSolution.criterion,
        misfitSum: misfitCriteriunSolution.misfitSum,
        rotationMatrixW: cloneMatrix3x3(misfitCriteriunSolution.rotationMatrixW),
        rotationMatrixD: cloneMatrix3x3(misfitCriteriunSolution.rotationMatrixD),
        stressRatio: misfitCriteriunSolution.stressRatio
    }
}

export function createDefaultSolution(criterion: MisfitCriteriun): MisfitCriteriunSolution {
    return {
        criterion,
        misfitSum: Number.POSITIVE_INFINITY,
        rotationMatrixW: newMatrix3x3(),
        rotationMatrixD: newMatrix3x3(),
        stressRatio: 0
    }
}

export class InverseMethod {
    private misfitCriteriunSolution: MisfitCriteriunSolution = {
        criterion: undefined,
        misfitSum: 0,
        rotationMatrixW: undefined,
        rotationMatrixD: undefined,
        stressRatio: 0
    }

    private faultSet: FaultSet = undefined
    private lambda: Vector3 = [0,0,0]
    // angleIntervalS = grid search parameter definning the angular interval around the stress directions estimated by the user
    private angleIntervalS = deg2rad(20)
    // The grid nodes in the 3-dimensional angular space are spaced 2° from one another (this values can be optimized for both time calculation and precision)
    private deltaAngle = deg2rad(2)
    // stressRatio0 = Initial stress ratio estimated by the user (sigma2 - sigma3) / (sigma1 - sigma3)
    private stressRatio0 = 0
    // stressRatioInterval = grid search parameter definning the stress ratio interval around the stress ratio estimated by the user
    private stressRatioInterval = 0.1
    // The grid nodes in the stress ratio dimension are spaced by deltaStressRatio from one another 
    //      (this values can be optimized for both time calculation and precision)
    private deltaStressRatio = 0.02
    private RTrot: Matrix3x3 = undefined

    private searchMethod: SearchMethod = new GridSearch()
    
    constructor(
        {
            lambda, RTrot, angleIntervalS, stressRatioInterval
        }:{
            lambda: number[],
            RTrot: Matrix3x3,
            angleIntervalS: number,
            stressRatioInterval: number
        })
    {
        //  Principal stresses (sigma_1, sigma_3, sigma_2) are defined directions S'' =  (X'', Y'', Z'' )
        this.lambda[0] = lambda[0]
        this.lambda[1] = lambda[1]
        this.lambda[2] = lambda[2]

        this.stressRatio0 = (this.lambda[2]-this.lambda[1])/(this.lambda[0]-this.lambda[1])
        // angleIntervalS = Angular interval around stress axes in radians (0,pi/4]
        this.angleIntervalS         = angleIntervalS

        // stressRatioInterval = Interval around the initial stress ratio R=(S2-S3)/(S1-S3) (0,1]
        this.stressRatioInterval    = stressRatioInterval

        this.RTrot = RTrot
    }

    addFaultSet(f: FaultSet) {
        if (this.faultSet === undefined) {
            this.faultSet = [...f]
        } else {
            this.faultSet = [...this.faultSet, ...f]
        }
    }

    setSearchMethod(search: SearchMethod) {
        this.searchMethod = search
    }

    setCriterion(criterion: MisfitCriteriun) {
        this.misfitCriteriunSolution.criterion = criterion
    }

    run(reset: boolean = true): MisfitCriteriunSolution {
        if (reset) {
            this.misfitCriteriunSolution.misfitSum = Number.POSITIVE_INFINITY
        }
        return this.searchMethod.run(this.misfitCriteriunSolution)
    }
}






// Inverse methods for calculating the stress tensor:
// sigma_1, sigma_2 and sigma_3 are termed s1, S2, and s3

// Dihedra method:
// For a single fault and slip datum, s1 and s3 must belong to the dihedra limited by the fault plane and the auxiliary plane


// 