export const stringify = (value: string | number | boolean) => {
    if (typeof value === 'boolean') {
        return value ? 'Ja' : 'Nein'
    }
    return String(value)
}
