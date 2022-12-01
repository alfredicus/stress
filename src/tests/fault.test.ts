import { Direction, Fault, SensOfMovement } from "../lib";

test('test fault class', () => {
    const f = new Fault({strike: 45, dipDirection: Direction.SE, dip: 60})
    f.setStriation({rake: 30, strikeDirection: Direction.NE, sensMouv: SensOfMovement.I})

    console.log(f)
    // expect(sigma_1.radius).toEqual(1)
})
