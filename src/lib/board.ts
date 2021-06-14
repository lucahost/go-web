import { Field, FieldLocation, PlayerColor, Vertex } from './types'
import { createField } from './field'

export const generateBoardLayout = (size: number): Field[] => {
    const board = new Array<Field>()

    // Iterate n rows
    for (let row = 1; row <= size; row++) {
        // Iterate n columns
        for (let col = 1; col <= size; col++) {
            board.push(createField([row, col]))
        }
    }
    return board
}

export const withNewFieldColor = (
    fields: Field[],
    vertex: Vertex,
    color: PlayerColor
): Field[] => {
    const index = fields.findIndex(
        field => field.vertex[0] === vertex[0] && field.vertex[1] === vertex[1]
    )
    fields[index] = {
        ...fields[index],
        color,
    }
    return fields
}

export const getFieldLocationByVertex = (
    vertex: Vertex,
    size: number
): FieldLocation => {
    const row = vertex[0]
    const col = vertex[1]
    if (row === 1 && col === 1) {
        return FieldLocation.UP_LEFT
    } else if (row === size && col === 1) {
        return FieldLocation.DOWN_LEFT
    } else if (row === 1 && col === size) {
        return FieldLocation.UP_RIGHT
    } else if (row === size && col === size) {
        return FieldLocation.DOWN_RIGHT
    } else if (row === 1) {
        return FieldLocation.UP
    } else if (row === size) {
        return FieldLocation.DOWN
    } else if (col === 1) {
        return FieldLocation.LEFT
    } else if (col === size) {
        return FieldLocation.RIGHT
    } else {
        // Markers for 9x9 goban
        if (
            size === 9 &&
            ((row === 5 && col === 5) ||
                (row === 3 && col === 3) ||
                (row === 3 && col === 7) ||
                (row === 7 && col === 3) ||
                (row === 7 && col === 7))
        ) {
            return FieldLocation.MARKER
        } else {
            return FieldLocation.MIDDLE
        }
    }
}
