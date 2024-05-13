export type DataStatus = {
    status: boolean,
    messages: string[],
    warnings: string[],
    errors: string[]
}

export function createDataStatus() {
    return {
        status: true,
        messages: [],
        warnings: [],
        errors: []
    }
}
