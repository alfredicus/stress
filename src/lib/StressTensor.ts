import { Matrix3x3, newMatrix3x3, Point3D, PoleCoords, SphericalCoords, Vector3 } from "./types"
import { lineSphericalCoords, trend2phi, rad2deg, multiplyTensors, stressTensorPrincipalAxes, transposeTensor } from "./utils"

export class StressTensor {
    /**
     * The new stress tensor is defined in a new reference sytem S' = (X',Y',Z') = (sigma 1, sigma 3, sigma 2)
     * Sigma 1 and sigma 3 axes can be defined interactively in the sphere (prefered solution) or chosen in a predefined range.
     * 
     * The stress axis Sigma_1 is defined by two angles in PoleCoords: trend and plunge.
     *      trend  = azimuth of sigma 1 in interval [0, 360), measured clockwise from the North
     *      plunge = vertical angle between the horizontal plane and the sigma 1 axis (positive downward), in interval [-90,90]
     * @param param0  
     */
    private poleS1: PoleCoords = new PoleCoords()

    /**
     * The stress axis Sigma_3 is defined by two angles in PoleCoords: trend and plunge.
     *      trend  = azimuth of sigma 3 in interval [0, 360), measured clockwise from the North
     *      plunge = vertical angle between the horizontal plane and the sigma 3 axis (positive downward), in interval [-90,90]
     * 
     * @param param0  
     */
    private poleS3: PoleCoords = new PoleCoords()

    // The user selects a Master Principal Stress (MPS) and a Subordinate/Slave Principal Stress (SPS), Sigma 1 or Sigma 3:
    //      The trend and plunge of the MPS are defined by the user
    //      The trend of the SPS is defined by the user while the plunge is calculated from the 3 selected angles
    //      The SPS is located in the plane perpendicular to the MPS.
    private masterStress: string
    private lambda: [number, number, number] = [0,0,0]

    private Rrot_: Matrix3x3 = newMatrix3x3()

    constructor(
        {trendS1, plungeS1, trendS3, plungeS3, masterStress, lambda}:
        {trendS1: number, plungeS1: number, trendS3: number, plungeS3: number, masterStress: string, lambda: [number, number, number]})
    {
        this.poleS1.plunge = plungeS1
        this.poleS3.plunge = plungeS3
        this.poleS1.trend  = trendS1
        this.poleS3.trend  = trendS3
        this.lambda[0]     = lambda[0]
        this.lambda[1]     = lambda[1]
        this.lambda[2]     = lambda[2]
        
        this.changeMasterStress(masterStress)

        // Perfom the computations...
        this.masterSlave()
    }

    changeMasterStress(v: string) {
        if (v !== 'σ1' && v !== 'σ3') throw new Error('master-stress must be either σ1 or σ3')
        this.masterStress = v
    }

    set plungeS1(v: number) {
        this.poleS1.plunge = v
        this.masterSlave()
    }
    set trendS1(v: number) {
        this.poleS1.trend = v
        this.masterSlave()
    }
    set plungeS3(v: number) {
        this.poleS3.plunge = v
        this.masterSlave()
    }
    set trendS3(v: number) {
        this.poleS3.trend = v
        this.masterSlave()
    }
    get plunge() {
        if (this.masterStress === 'σ1') {
            return this.poleS3.plunge
        }
        else {
            return this.poleS1.plunge
        }
    }

    /**
     * Example:
     * ```ts
     * const s = new StressTensor({trendS1, plungeS1, trendS3, plungeS3, masterStress, lambda})
     * const r = s.Rrot
     * ```
     */
    get Rrot(): Matrix3x3 {
        return this.Rrot_
    }

    get RTrot(): Matrix3x3 {
        return transposeTensor(this.Rrot_)
    }

    masterSlave() {
        // Calculate the plunge of the Slave stress axis
        if ( this.masterStress === 'σ1') {
            // The trend and plunge of sigma 1 are set by the user
            const sigma = lineSphericalCoords({
                trend: this.poleS1.trend,
                plunge: this.poleS1.plunge
            })

            // The trend of sigma 3 is set by the user while the plunge of sigma 3 has to be calculated
            const phiS3    = trend2phi( this.poleS3.trend)
            const thetaS3  = this.thetaSlave(sigma.phi, sigma.theta, phiS3 )
            this.poleS3.plunge = rad2deg ( thetaS3 - Math.PI/2 )

        } else {
            // The trend and plunge of sigma 3 are set by the user
            const sigma = lineSphericalCoords({
                trend: this.poleS3.trend, 
                plunge: this.poleS3.plunge
            })
 
            // The trend of sigma 1 is set by the user while the plunge of sigma 3 has to be calculated
            const phiS1   = trend2phi( this.poleS1.trend)
            const thetaS1 = this.thetaSlave(sigma.phi, sigma.theta, phiS1 )
            this.poleS1.plunge = rad2deg ( thetaS1 - Math.PI/2 )
        }
    }

    private thetaSlave(phiMaster: number, thetaMaster: number, phiSlave): number {
        // thetaSlave: colatitude or polar angle of the slave stress axis measured downward from the zenith (upward direction) [0, PI)
        let thetaSlave = 0

        if ( thetaMaster > 0 && thetaMaster < Math.PI / 2) {
            // The master stress axis is in the upper hemisphere
            // phi_NormalPlane = azimuthal angle of the normal plane in inteerval [0, 2 PI):
            //  The plane is located in the upper hemisphere in the anticlockwise direction realtive to phi_NormalPlane   
            let phi_NormalPlane = phiMaster + Math.PI / 2
            if ( phi_NormalPlane >= 2 * Math.PI ) {
                phi_NormalPlane -= 2 * Math.PI
            }
            // phi_Y_NormalPlane = inclination angle of the normal fault plane (0, PI/2 )()
            let phi_Y_NormalPlane = thetaMaster
            // phi_NP_Slave = azimuthal angle between phi_NormalPlane and phiSlave
            let phi_NP_Slave = phiSlave - phi_NormalPlane
            // Analytic equation relating angles in spherical coords 
            thetaSlave = Math.atan( 1 / ( Math.sin( phi_NP_Slave ) * Math.tan( phi_Y_NormalPlane ) ) )
            if ( thetaSlave < 0 ) {
                thetaSlave += Math.PI
            }
        } else if ( thetaMaster > Math.PI / 2 ){
            // The master stress axis is in the lower hemisphere
            let phi_NormalPlane = phiMaster - Math.PI / 2
            if ( phi_NormalPlane < 0 ) {
                phi_NormalPlane += 2 * Math.PI
            }
            // phi_Y_NormalPlane = inclination angle of the normal fault plane (0, PI/2 )()
            let phi_Y_NormalPlane = Math.PI - thetaMaster
            // phi_NP_Slave = azimuthal angle between phi_NormalPlane and phiSlave
            let phi_NP_Slave = phiSlave - phi_NormalPlane
            // Analytic equation relating angles in spherical coords 
            thetaSlave = Math.atan( 1 / ( Math.sin( phi_NP_Slave ) * Math.tan( phi_Y_NormalPlane ) ) )
            if ( thetaSlave < 0 ) {
                thetaSlave += Math.PI
            }
        } else if ( thetaMaster === 0 ){  
            // The master stress axis is vertical

        } else if ( thetaMaster === Math.PI / 2 ){  // angle in degrees can be more precise for this test
            // The master stress axis is horizontal

        }
        return thetaSlave
    }

    private rotationTensors(sigma_1_sphere: SphericalCoords, sigma_3_sphere: SphericalCoords) {
        // Calculate the rotation tensors between reference frames S and S', where
        // S' = (X',Y',Z') is the principal stress reference frame, parallel to (sigma_1, sigma_3, sigma_2);
        // S =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
        //
        // Let Rrot be the rotation tensor R between reference systems S and S', such that:
        //      V' = R V,  where V and V' are the same vector defined in reference frames S and S', respectively

        // The lines of matrix R are given by the unit vectors parallel to X1', X2', and X3' defined in reference system S:
        // Sigma_1 axis: Unit vector e1'. The scalar product: e1'.V = V'(1)
        const Rrot: Matrix3x3 = newMatrix3x3()

        Rrot[0][0] = Math.sin(sigma_1_sphere.theta) * Math.cos(sigma_1_sphere.phi)
        Rrot[0][1] = Math.sin(sigma_1_sphere.theta) * Math.sin(sigma_1_sphere.phi)
        Rrot[0][2] = Math.cos(sigma_1_sphere.theta)
    
        // Sigma_3 axis: Unit vector e2'. The scalar product: e2'.V = V'(2)
        Rrot[0][0] = Math.sin(sigma_3_sphere.theta) * Math.cos(sigma_3_sphere.phi)
        Rrot[0][1] = Math.sin(sigma_3_sphere.theta) * Math.sin(sigma_3_sphere.phi)
        Rrot[0][2] = Math.cos(sigma_3_sphere.theta)
    
         // Sigma_2 axis: Unit vector e3'. The scalar product: e3'.V = V'(3)
        // e3' is calculated from the cross product e3' = e1' x e2' :
    
        Rrot[2][0] = Rrot[0][1] * Rrot[1][2] - Rrot[0][2] * Rrot[1][1] 
        Rrot[2][1] = Rrot[0][2] * Rrot[1][0] - Rrot[0][0] * Rrot[1][2]
        Rrot[2][2] = Rrot[0][0] * Rrot[1][1] - Rrot[0][1] * Rrot[1][0]

        // Let RTrot be the rotation tensor R between reference systems S' and S, such that:
        //      V = RTrot V',  where V and V' are the same vector defined in reference frames S and S', respectively

        // The rotation tensor RTrot is defined by the transposed of rotation tensor Rrot since reference systems S and S' are both orthonormal
        let RTrot: Matrix3x3 = newMatrix3x3()

        RTrot = transposeTensor(Rrot)

        for (let i = 0; i < 3; i++) {
            for (let j = 0; i < 3; j++) {
                RTrot[j][i] = Rrot [i][j]
            }
        }
    } 

    private stressTensorS(): Matrix3x3 {
        // Calculate the stress tensor ST in reference frame S from the stress tensor in reference frame S':
        //      ST = RTrot STP Rrot
        //
        // where
        //
        //      S' = (X',Y',Z') is the principal stress reference frame, parallel to (sigma_1, sigma_3, sigma_2);
        //      S =  (X, Y, Z ) is the geographic reference frame  oriented in (East, North, Up) directions.
        //      STP = Stress tensor in the principal stress reference frame.

        let STP: Matrix3x3 = newMatrix3x3()
        STP = stressTensorPrincipalAxes( this.lambda.map( v => -v) as Vector3 )
    
        let T1 : Matrix3x3 = newMatrix3x3()
        T1 = multiplyTensors({A: transposeTensor(this.Rrot_), B: STP})

        let ST : Matrix3x3 = newMatrix3x3()
        return multiplyTensors({A: T1, B: this.Rrot_})
    }
    







    // This function calculates the azimuth phi such that the right-handed local coordinate system in polar coordinates is located in the upper hemisphere.
    //      In other words, the radial unit vector is in the upper hemisphere.
    
    // The right-handed local reference system is specified by three unit vectors defined in the increasing radial, polar, and azimuthal directions (r, theta, and phi):
    //      The azimuthal angle phi is chosen in the direction of the fault dip (note that phi is different from the azimuth of the fault plane measured in the field) 
    //      The unit vector e_theta is parallel to the dip of the fault plane
    //      The unit vector e_phi is is parallel to the strike of the fault plane, and is oriented such that e_theta x e_phi = e_r (where x is the cross porduct )
    //          

     /*
        this.normalSp[0] = R[0,0] * this.normal[0] + R[0,1] * this.normal[1] + R[0,2] * this.normal[2] 
        this.normalSp[1] = R[1,0] * this.normal[0] + R[1,1] * this.normal[1] + R[1,2] * this.normal[2] 
        this.normalSp[2] = R[2,0] * this.normal[0] + R[2,1] * this.normal[1] + R[2,2] * this.normal[2] 

        // Each fault is defined by a set of parameters as follows:
        //      The fault plane orientation is defined by three parameters:
        //      Fault strike: clockwise angle measured from the North direction [0, 360)
        //      Fault dip: [0, 90]
        //      Dip direction: (N, E, S, W) or a combination of two directions (NE, SE, SW, NW).
    
        // (phi,theta) : spherical coordinate angles defining the unit vector perpendicular to the fault plane (pointing upward)
        //                 in the geographic reference system: S = (X,Y,Z) = (E,N,Up)
    


    /**
  
export class Vector {
    // Define vector in spherical coordinates
    // All properties are public by default
    // Define vector in catesian coordinates
    x: number; 
    y: number;  
    z: number;

    /**
     * 
     * @param radius The radius of the sphere
     * @param theta 
     * @param phi 
     */
    // constructor(public radius: number, public theta: number, public phi: number) {
    //     this.x = this.radius * Math.sin( this.phi) * Math.cos( this.theta);;
    //     this.y = this.radius * Math.sin( this.phi) * Math.sin( this.theta);;
    //     this.z = this.radius * Math.cos( this.phi);
    // }

    /**
     * Rotate the tensor about an angle...
     * @param rotAx_phi 
     */
    vector_rotation(rotAx_phi: number): void {
        // this.x = Math.sin( rotAx_phi);
    }
}
