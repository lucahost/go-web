import { Field, GoBoard, PlayerColor, Vertex } from './types'
import {
    findFieldOnBoardByVertex,
    getGroupLiberties,
} from './board-queries'
import {
    handleCapture,
    setStone,
} from './board-commands'

export const isInBounds = (board: GoBoard, move: Field): boolean => {
    return (
        move.vertex[0] >= 0 &&
        move.vertex[0] - 1 < board.height &&
        move.vertex[1] >= 0 &&
        move.vertex[1] - 1 < board.width
    )
}

export const isOccupied = (board: GoBoard, vertex: Vertex): boolean => {
    if (board.fields.length == 0) return false

    return findFieldOnBoardByVertex(board, vertex).color !== PlayerColor.EMPTY
}

/*
 * A stone that would have no liberties (or fill the last liberty of your group)
 * must not be placed unless the move captures something. In that case it is
 * allowed (because the capture gives you at least one liberty).
 */
export const isSuicide = (
    board: GoBoard,
    vertex: Vertex,
    playerColor: PlayerColor
): boolean => {
    // Check if the move would capture something
    // To not pass references to the original board around we need to
    // perform a deep copy of the board
    const boardDeepCopy = JSON.parse(JSON.stringify(board)) as GoBoard
    const boardAfterHandleCapture = handleCapture(
        boardDeepCopy,
        vertex,
        playerColor
    )
    if (board.captures < boardAfterHandleCapture.captures) {
        return false
    }
    // Check Liberties on move
    const boardAfterMove = setStone(boardDeepCopy, {
        vertex,
        color: playerColor,
    })
    return getGroupLiberties(boardAfterMove, vertex).length === 0
}

export const isKo = (board: GoBoard, move: Field): boolean => {
    // Check if the move would capture something
    // To not pass references to the original board around we need to
    // perform a deep copy of the board
    const secondLastMove = board.history[board.history.length - 2]
    const lastCapture = board.captures[board.captures.length - 1]
    return (
        lastCapture &&
        secondLastMove &&
        lastCapture.color === move.color &&
        lastCapture.vertex[0] === move.vertex[0] &&
        lastCapture.vertex[1] === move.vertex[1] &&
        secondLastMove.color === move.color &&
        secondLastMove.vertex[0] === move.vertex[0] &&
        secondLastMove.vertex[1] === move.vertex[1]
    )
}
