# Data thar are ready
- Extension Fracture
- Stylolite Interface
- Striated Plane Kin


# Todo

## Testing
- `predict()`

## `initialize()`
- verifier que appel à `createDataArgument`
- verifier que `createDataArgument` a comme argument `toks`
```ts
const arg = createDataArgument(toks)
```

## `predict()`
- verifier que la methode `predict()` est implémentée. Celle-ci doit retournela data virtuelle pour un tenseur de conrtainte donné
- dans `StriatedPlane_kin.ts`, refaire cette méthode => renvoyer
```ts
{
    normal: Vector3, // calculé (ou pas)
    striation: Vector3 // calculé
}
```
- pour exemple, dans `ExtensionFracture.ts`, on renvoie
```ts
normal: Vector3 // calculé qui est S3
    
```