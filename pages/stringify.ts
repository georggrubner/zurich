export const stringify = (value: string | number | boolean) => {
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
    }
    return String(value)
}
