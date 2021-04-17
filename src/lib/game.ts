import { Field, GameState, GoBoard, Player } from './types'
import { arrayEquals } from './utils'

export const start = (players: [Player, Player]): GoBoard => {
    const width = 9
    const height = 9

    return {
        status: GameState.INITIALIZED,
        captures: [],
        currentPlayer: players[0],
        fields: [],
        height,
        history: [],
        identifier: '',
        pass: false,
        players: players,
        width,
    }
}

export const move = (board: GoBoard, move: Field): GoBoard => {
    // Check if move is in bounds
    if (!isInBounds(board, move)) {
        throw new Error(`Move on location ${move.vertex} is out of bounds`)
    }

    // Check if the color of the move matches the current players color
    if (board.currentPlayer.color !== move.color) {
        throw new Error(`current player is not ${move.color}`)
    }

    if (isOccupied(board, move)) {
        throw new Error(
            `Move on location ${
                move.vertex
            } is not possible. Already occupied. Fields ${board.fields.map(
                f => `${f.vertex}, `
            )}`
        )
    }
    if (isSuicide(board, move)) {
        // Handle suicide
        throw new Error()
    }
    // Handle capture
    board = handleCapture(board, move)

    // Handle Ko
    if (isKo(board, move)) {
        throw new Error()
    }

    // From here on: Valid move !
    // Add move to fields
    board = setStone(board, move)
    // Switch current player
    board = switchPlayer(board)
    // Reset passes on players if not a double-pass
    board = resetPass(board)
    // Add history
    board = addHistory(board, move)

    // Change state to running
    return { ...board, status: GameState.RUNNING }
}

export const pass = (board: GoBoard): GoBoard => {
    if (board.pass) {
        // Handle double-pass
        return board
    } else {
        return { ...board, pass: true }
    }
}

export const end = (): void => {
    return
}

// TODO: separate functions below here

export const isInBounds = (board: GoBoard, move: Field): boolean => {
    return (
        move.vertex[0] >= 0 &&
        move.vertex[0] - 1 < board.height &&
        move.vertex[1] >= 0 &&
        move.vertex[1] - 1 < board.width
    )
}

export const isOccupied = (board: GoBoard, move: Field): boolean => {
    if (board.fields.length == 0) return false

    return board.fields.some((field: Field) =>
        arrayEquals(field.vertex, move.vertex)
    )
}

export const isSuicide = (board: GoBoard, move: Field): boolean => {
    // Check Liberties on Stone

    // Should be done recursively - Big Boundaries

    return false
}

export const isKo = (board: GoBoard, move: Field): boolean => {
    return false
}

export const handleCapture = (board: GoBoard, move: Field): GoBoard => {
    return board
}

export const setStone = (board: GoBoard, move: Field): GoBoard => {
    board.fields.push(move)
    return board
}

export const switchPlayer = (board: GoBoard): GoBoard => {
    if (board.players.length !== 2) {
        throw new Error('Incorrect count of players in game')
    }

    const nextPlayer = board.players.find(
        p => p.identifier !== board.currentPlayer.identifier
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

export const getLiberties = (board: GoBoard, field: Field): Field[] => [field]
