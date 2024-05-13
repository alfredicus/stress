# JSON file format

All possible fields are listed below:
```ts
{
    // Mandatory
    id: number | number[],
    type: string,

    // Optional
    strike: number | number[],
    dip: number | number[],
    dipDirection: Direction | Direction[],

    rake: number | number[],
    strikeDirection: Direction | Direction[],
    striationTrend: number | number[],
    striationType: StriationType | StriationType[],
    typeOfMovement: TypeOfMovement | TypeOfMovement[],

    strikeBed: number | number[],v
    dipBed: number | number[],
    dipDirectionBed: Direction | Direction[],

    lineTrend: number | number[],
    linePlunge: number | number[],

    deformationPhase: number | number[],
    relativeWeight: number | number[],

    strengthAngle: StrengthAngleType | StrengthAngleType[],
    minAngle: number | number[],
    maxAngle: number | number[],

    scale: number | number[],

    position: Vector3 | Vector3[],
 
    // For testing only
    normal: Vector3 | Vector3[]
}
```

### Example for `Extension Fracture`, `Stylolite Interface`

```ts
{
    // Mandatory
    id: number | number[],
    type: string,
    strike: number | number[],
    dip: number | number[],
    dipDirection: Direction | Direction[],

    // Optional
    position: Vector3 | Vector3[]
}
```