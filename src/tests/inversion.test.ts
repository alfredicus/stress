import { Direction, Fault, SensOfMovement } from "../lib"
import { misfitCriterion as etchecopar } from "../lib/criteria/Etchecopar"
import { FaultSet } from "../lib/FaultSet"
import { InverseMethods } from "../lib/InverseMethod"
import { deg2rad } from "../lib/utils"

test('test inversion 1', () => {
    const faultSet: FaultSet = []

    console.log('0')
    faultSet.push( new Fault({
        strike: 45,
        dip: 60,
        dipDirection: Direction.SE,
        rake: 5,
        strikeDirection: strikeDirection.NE,
        sensOfMovement: SensOfMovement.RL 
    }) )

    console.log('1')
    faultSet.push( new Fault({
        strike: 135,
        dip: 30,
        dipDirection: Direction.NW,
        rake: 5,
        strikeDirection: strikeDirection.SE,
        sensOfMovement: SensOfMovement.LL 
    }) )

    console.log('2')
    faultSet.push( new Fault({
        strike: 220,
        dip: 80,
        dipDirection: Direction.NW,
        rake: 3,
        strikeDirection: strikeDirection.SW,
        sensOfMovement: SensOfMovement.RL 
    }) )

    console.log('3')
    faultSet.push( new Fault({
        strike: 320,
        dip: 70,
        dipDirection: Direction.SE,
        rake: 3,
        strikeDirection: strikeDirection.NW,
        sensOfMovement: SensOfMovement.LL 
    }) )

 
    // ...

    const inv = new InverseMethods({
        lambda: [0, 0.5, 1],
        RTrot: [[1,0,0], [0,1,0], [0,0,1]],
        angleIntervalS: deg2rad(15),
        stressRatioInterval: 0.2
    })
    console.log('2')
    inv.addMisfitCriteriun( etchecopar )
    console.log('3')
    inv.addFaultSet(faultSet)
    console.log('4')
    inv.run()
})
