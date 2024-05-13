import { filter } from "../../lib/filters/Factory"

test('filter csv', () => {
    const buffer = `


        Id  ; type; strike; dip;            dip direction; rake; strike direction; type    of  movement
    1; Extension Fracture;120;90;W
    2;   Stylolite Interface   ;30   ;  90;   W
    7; Striated Plane;115;90;N;0;E;     Right   Lateral                 


    9; Striated Plane;125;90;N;0;E;Left Lateral

    5; Striated Plane;      30; 5   ; E ;90;N     ;    Inverse
    20; Striated Plane;210;5;W;90;S;Inverse

    `

    try {
        const json = filter.Factory.convert('csv', buffer)
        console.log(json)
    }
    catch(e) {
        console.error('error')
        throw e
    }

})
