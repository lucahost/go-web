import { Field, GameState, GoBoard, Player } from './types'

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
    // Handle suicide
    if (isSuicide(board, move)) {
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

    return board
}

export const pass = (board: GoBoard): GoBoard => {
    // Handle double-pass
    return board
}

export const end = (): void => {
    return
}

// TODO: separate functions below here
export const isSuicide = (board: GoBoard, move: Field): boolean => {
    return true
}

const isKo = (board: GoBoard, move: Field): boolean => {
    return true
}

const handleCapture = (board: GoBoard, move: Field): GoBoard => {
    return board
}

const setStone = (board: GoBoard, move: Field): GoBoard => {
    // Replace field with new set stone
    return board
}

const switchPlayer = (board: GoBoard): GoBoard => {
    // Switch players
    return board
}

const resetPass = (board: GoBoard): GoBoard => ({ ...board, pass: false })

const addHistory = (board: GoBoard, move: Field): GoBoard => {
    board.history.push(move)
    return board
}

const getLiberties = (board: GoBoard, field: Field): GoBoard => board
