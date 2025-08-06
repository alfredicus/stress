/**
 * @brief Normalizes a column name by converting it to lowercase,
 * replacing hyphens and underscores with spaces, and removing extra spaces.
 * @param columnName The column name to normalize.
 * @returns The normalized column name.
 * @example
 * normalizeName('Sample-Column_Name'); // Returns 'sample column name'
 * normalizeName('  Sample  Column  '); // Returns 'sample column'
 */
export function normalizeName(columnName: string): string {
    return columnName
        .toLowerCase()
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * @brief Maps normalized column names to standardized names
 */
export function mapColumnName(normalizedName: string): string {
    const columnMappings: { [key: string]: string } = {
        'id': 'id',
        'active': 'active',
        'type': 'type',
        'deformation phase': 'deformation phase',
        'relative weight': 'relative weight',
        'scale': 'scale',
        'x': 'x',
        'y': 'y',
        'z': 'z',
        'strike': 'strike',
        'strike [0 360)': 'strike',
        'dip': 'dip',
        'dip [0 90]': 'dip',
        'dip direction': 'dip direction',
        'rake': 'rake',
        'rake [0 90]': 'rake',
        'strike direction': 'strike direction',
        'striation trend': 'striation trend',
        'striation trend [0 360)': 'striation trend',
        'type of mouvement': 'type of movement',
        'type of movement': 'type of movement',
        'line trend': 'line trend',
        'line trend [0 360)': 'line trend',
        'line plunge': 'line plunge',
        'line plunge [0 90]': 'line plunge',
        'min friction angle': 'min friction angle',
        'max friction angle': 'max friction angle',
        'min angle s1 n': 'min angle <s1-n>',
        'min angle <s1 n>': 'min angle <s1-n>',
        'max angle s1 n': 'max angle <s1-n>',
        'max angle <s1 n>': 'max angle <s1-n>',
        'bedding plane strike': 'bedding plane strike',
        'bedding plane dip': 'bedding plane dip',
        'bedding plane dip direction': 'bedding plane dip direction'
    };

    return columnMappings[normalizedName] || normalizedName;
}

/**
 * @brief Validates geological data based on its type.
 * This function checks if the required fields are present for each type of geological data.
 * It returns an array of error messages if any required fields are missing.
 * @param dataType The type of geological data to validate.
 * @param data The geological data to validate, represented as a key-value object.
 * @returns An array of error messages if validation fails, or an empty array if validation passes
 */
export function validateGeologicalData(
    dataType: string | undefined,
    data: Record<string, any>
): string[] {
    const errors: string[] = [];

    if (!dataType) {
        errors.push('Missing data type');
        return errors;
    }

    const normalizedType = dataType.toLowerCase().trim();

    const inject = (field: string) => errors.push(`Missing ${field}`); // lambda for error injection

    // List of data types requiring specific information
    const planeDataTypes = [
        'striated plane',
        'extension fracture',
        'joint',
        'dyke',
        'stylolite interface',
        'dilation band',
        'compaction band',
        'neoformed striated plane',
        'striated compactional shear band',
        'striated dilatant shear band'
    ];
    // Check for required plane information
    if (planeDataTypes.includes(normalizedType)) {
        if (data['strike'] === undefined) inject('strike');
        if (data['dip'] === undefined) inject('dip');
    }

    const striatedDataTypes = [
        'striated plane',
        'neoformed striated plane',
        'striated compactional shear band',
        'striated dilatant shear band',
        'conjugate fault planes'
    ];
    // Check for required plane information
    if (striatedDataTypes.includes(normalizedType)) {
        if (data['type of movement'] === undefined) inject('type of movement');
    }

    const axisDataTypes = [
        'stylolite teeth',
        'crystal fibers in vein'
    ];
    // Check for required plane information
    if (axisDataTypes.includes(normalizedType)) {
        if (data['line trend'] === undefined) inject('line trend');
        if (data['line plunge'] === undefined) inject('line plunge');
    }

    return errors;
}
