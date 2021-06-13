import { Field, FieldLocation, PlayerColor, Vertex } from './types'
import { createField } from './field'

export const generateBoardLayout = (size: number): Field[] => {
    const board = new Array<Field>()

    // Iterate n rows
    for (let row = 1; row <= size; row++) {
        // Iterate n columns
        for (let col = 1; col <= size; col++) {
            if (row === 1 && col === 1) {
                // Up left
                board.push(createField([row, col], FieldLocation.UP_LEFT))
            } else if (row === size && col === 1) {
                // Up right
                board.push(createField([row, col], FieldLocation.DOWN_LEFT))
            } else if (row === 1 && col === size) {
                // Down left
                board.push(createField([row, col], FieldLocation.UP_RIGHT))
            } else if (row === size && col === size) {
                // Down right
                board.push(createField([row, col], FieldLocation.DOWN_RIGHT))
            } else if (row === 1) {
                // Left
                board.push(createField([row, col], FieldLocation.UP))
            } else if (row === size) {
                // Right
                board.push(createField([row, col], FieldLocation.DOWN))
            } else if (col === 1) {
                // Up
                board.push(createField([row, col], FieldLocation.LEFT))
            } else if (col === size) {
                // Right
                board.push(createField([row, col], FieldLocation.RIGHT))
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
                    // Middle marked
                    board.push(createField([row, col], FieldLocation.MARKER))
                } else {
                    // Middle unmarked
                    board.push(createField([row, col], FieldLocation.MIDDLE))
                }
            }
        }
    }
    return board
}

export const withNewFieldColor = (
    board: Field[],
    vertex: Vertex,
    color: PlayerColor
): Field[] => {
    const index = board.findIndex(
        field => field.vertex[0] === vertex[0] && field.vertex[1] === vertex[1]
    )
    board[index] = {
        ...board[index],
        color,
        location:
            color === PlayerColor.BLACK
                ? FieldLocation.BLACK_STONE
                : FieldLocation.WHITE_STONE,
    }
    return board
}
