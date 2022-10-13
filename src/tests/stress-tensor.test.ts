import { Vector } from "../lib";

test('test stress 1 item', () => {
    let sigma_1 = new Vector(1, 0, Math.PI / 2);
    console.log(sigma_1);

    let sigma_2 = new Vector(1, Math.PI / 2, Math.PI / 2);
    console.log(sigma_2);

    let rotAx = Math.PI;
    sigma_1.vector_rotation(rotAx);
    console.log(sigma_1);

    expect(sigma_1.radius).toEqual(1)
})
