/**
 * Removes the trailing white space, line terminator and tabulation characters from a string.
 * 
 * Furthermore, for the remaining words in the string, remove extra white spaces and tabulations between them
 */
export function trimAll(s: string) {
    return s
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/, '')
        .replace('\t', ' ')
        .trimEnd()
}
