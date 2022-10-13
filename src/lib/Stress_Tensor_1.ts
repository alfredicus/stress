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
    constructor(public radius: number, public theta: number, public phi: number) {
        this.x = this.radius * Math.sin( this.phi) * Math.cos( this.theta);;
        this.y = this.radius * Math.sin( this.phi) * Math.sin( this.theta);;
        this.z = this.radius * Math.cos( this.phi);
    }

    /**
     * Rotate the tensor about an angle...
     * @param rotAx_phi 
     */
    vector_rotation(rotAx_phi: number): void {
        this.x = Math.sin( rotAx_phi);
    }
}
