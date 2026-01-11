import { Field, FieldLocation, GoBoard, PlayerColor, Vertex } from './types'
import { withoutDuplicates } from './utils'

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

export const findFieldOnBoardByVertex = (
    board: GoBoard,
    vertex: Vertex
): Field => {
    const boardField = board.fields.find(
        field => field.vertex[0] === vertex[0] && field.vertex[1] === vertex[1]
    )

    if (!boardField) {
        throw new Error('Move does not exist in board')
    }

    return boardField
}

export const getLiberties = (board: GoBoard, vertex: Vertex): Field[] => {
    const directNeighborFields = getDirectNeighborFields(board, vertex)

    return directNeighborFields.filter(
        field => field.color === PlayerColor.EMPTY
    )
}

export const getGroupLiberties = (board: GoBoard, vertex: Vertex): Field[] => {
    const liberties: Field[] = []
    const group = getGroupByVertex(board, vertex)

    for (const field of group) {
        liberties.push(...getLiberties(board, field.vertex))
    }

    // only unique fields
    return withoutDuplicates(liberties)
}

export const getGroupByVertex = (
    board: GoBoard,
    vertex: Vertex,
    group: Field[] = []
): Field[] => {
    // find the current field on the board by it's vertex
    const field = findFieldOnBoardByVertex(board, vertex)
    // find the direct neighbors of the same color of the current field
    const directNeighborFields = getDirectNeighborFields(board, vertex).filter(
        neighborField => neighborField.color === field.color
    )
    // only consider yet unknown neighbors and the current field itself
    const newDirectNeighborFields = getNewUniqueFields(group, [
        ...directNeighborFields,
        field,
    ])
    // set the yet known group
    group.push(...newDirectNeighborFields)
    // for each of the new neighbors recursively add any newly identified fields
    for (const neighbor of newDirectNeighborFields) {
        group.push(
            ...getNewUniqueFields(
                group,
                getGroupByVertex(board, neighbor.vertex, group)
            )
        )
    }
    return group
}

export const getNewUniqueFields = (
    fields: Field[],
    newFields: Field[]
): Field[] => {
    const newUniqueFields: Field[] = []
    for (const newField of newFields) {
        if (!fields.includes(newField)) {
            newUniqueFields.push(newField)
        }
    }
    return newUniqueFields
}

export const getDirectNeighborFields = (
    board: GoBoard,
    vertex: Vertex
): Field[] => {
    const row = vertex[0]
    const col = vertex[1]
    const maxRow = board.height
    const maxCol = board.width

    // Walk rows up if not at max
    return board.fields.filter(field => {
        return (
            // Walk rows up if not out of board
            (row - 1 >= 1 &&
                field.vertex[0] === row - 1 &&
                field.vertex[1] === col) ||
            // Walk rows down if not at max
            (row + 1 <= maxRow &&
                field.vertex[0] === row + 1 &&
                field.vertex[1] === col) ||
            // Walk cols left if not out of board
            (col - 1 >= 1 &&
                field.vertex[1] === col - 1 &&
                field.vertex[0] === row) ||
            // Walk cols right if not at max
            (col + 1 <= maxCol &&
                field.vertex[1] === col + 1 &&
                field.vertex[0] === row)
        )
    })
}

export const getDirectNeighborFieldsOfOppositeColor = (
    board: GoBoard,
    vertex: Vertex,
    playerColor: PlayerColor
): Field[] =>
    getDirectNeighborFields(board, vertex).filter(
        field => field.color === getOppositeColor(playerColor)
    )

export const getOppositeColor = (color: PlayerColor) =>
    color === PlayerColor.BLACK ? PlayerColor.WHITE : PlayerColor.BLACK
