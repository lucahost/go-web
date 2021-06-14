export const chunk = <T>(input: T[], size: number) => {
    return input.reduce((arr: T[][], item, idx) => {
        return idx % size === 0
            ? [...arr, [item]]
            : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
    }, [])
}

export const arrayEquals = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i])

export const withoutDuplicates = <T>(list: T[]) =>
    list.filter((obj, index) => {
        const _obj = JSON.stringify(obj)
        return index === list.findIndex(obj => JSON.stringify(obj) === _obj)
    })
