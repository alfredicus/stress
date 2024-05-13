# CSV file format

Numbers represent the line columns for eah data of the csv file (e.g., exported from Excel).
- First and second columns (`id` and `type`) are mandatory and must be at columns 1 and 2, respectively (1 being the first column).
- All the others columns are optional and depend on the type of data
- Their order depend on the user and is described in the header

## Possible columns and suggested order
```python
0 : Data number

1 : Data type (see DataFactory)

# Plane
2 : Strike
3 : Dip
4 : Dip direction

# Striation
5 : Rake
6 : Strike direction
7 : Striation trend
8 : Striation type
9 : Type of movement

# Local bedding plane
10: Strike bedding
11: Dip bedding
12: Dip direction bedding

# Line
13: Line trend
14: line plunge

# Complementary info
15: Deformation phase
16: Related weight

17: Strength angle
18: Minimum angle
19: Maximum angle

# Spacial scaling
20: Scale

# Localization
21: x
22: y
23: z
```