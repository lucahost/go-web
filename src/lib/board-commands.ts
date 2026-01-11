import { Field, GoBoard, Player, PlayerColor, Vertex } from './types'
import { createField } from './field'
import { withoutDuplicates } from './utils'
import {
    findFieldOnBoardByVertex,
    getDirectNeighborFieldsOfOppositeColor,
    getGroupByVertex,
    getGroupLiberties,
} from './board-queries'

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

export const handleCapture = (
    board: GoBoard,
    vertex: Vertex,
    playerColor: PlayerColor
): GoBoard => {
    // get neighbors of move that are of opposite color
    // if the direct neighbor group only has a single liberty
    // which is exactly the current move
    // then move the whole group to captures
    const captures: Field[] = []
    for (const neighbor of getDirectNeighborFieldsOfOppositeColor(
        board,
        vertex,
        playerColor
    )) {
        // get group
        const group = getGroupByVertex(board, neighbor.vertex)
        // check group liberties of neighbors of opposite color
        const groupLiberties = getGroupLiberties(board, neighbor.vertex)
        // if 0 -> remove & add to board.captures
        if (
            groupLiberties.length === 1 &&
            groupLiberties[0].vertex[0] === vertex[0] &&
            groupLiberties[0].vertex[1] === vertex[1]
        ) {
            captures.push(...group)
        }
    }
    return boardWithGroupToCaptures(board, captures)
}

const boardWithGroupToCaptures = (board: GoBoard, group: Field[]): GoBoard => {
    for (const field of withoutDuplicates(group)) {
        board.captures.push({
            vertex: field.vertex,
            color: field.color,
        })
        findFieldOnBoardByVertex(board, field.vertex).color = PlayerColor.EMPTY
    }
    return board
}

export const setStone = (board: GoBoard, move: Field): GoBoard => {
    const boardField = findFieldOnBoardByVertex(board, move.vertex)
    boardField.color = move.color

    board.fields = withNewFieldColor(board.fields, move.vertex, move.color)
    return board
}

export const switchPlayer = (board: GoBoard, players: Player[]): GoBoard => {
    if (players?.length !== 2) {
        throw new Error('Incorrect count of players in game')
    }

    const nextPlayer = players?.find(
        p => p.userId !== board?.currentPlayer?.userId
    )

    if (!nextPlayer) {
        throw new Error('Exception loading next player')
    }
    return { ...board, currentPlayer: nextPlayer }
}

export const resetPass = (board: GoBoard): GoBoard => ({
    ...board,
    pass: false,
})

export const addHistory = (board: GoBoard, move: Field): GoBoard => {
    board.history.push(move)
    return board
}
