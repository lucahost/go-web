import { Field, GameState, GoBoard, Player, PlayerColor } from './types'
import { generateBoardLayout } from './board'

export const start = (players: [Player, Player]): GoBoard => {
    const width = 9
    const height = 9

    return {
        status: GameState.INITIALIZED,
        captures: [],
        currentPlayer: players[0],
        fields: generateBoardLayout(width),
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
        throw new Error('Suicide')
    }

    // Handle Ko
    if (isKo(board, move)) {
        throw new Error()
    }

    // From here on: Valid move !
    // Add move to fields
    board = setStone(board, move)
    // Handle capture
    board = handleCapture(board, move)
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
        // TODO: Handle double-pass
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

    return (
        findFieldOnBoardByMoveVertices(board, move).color !== PlayerColor.EMPTY
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isSuicide = (board: GoBoard, move: Field): boolean => {
    // Check Liberties on Stone
    // Should be done recursively - Big Boundaries

    return getLiberties(board, move).length === 0
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isKo = (board: GoBoard, move: Field): boolean => {
    // if board would look the same after performing the move
    // return true
    // else
    return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleCapture = (board: GoBoard, move: Field): GoBoard => {
    // get neighbors of move of opposite color
    // check liberties of neighbors of opposite color
    // if 0 -> remove & add to board.captures
    return board
}

export const setStone = (board: GoBoard, move: Field): GoBoard => {
    const boardField = findFieldOnBoardByMoveVertices(board, move)
    boardField.color = move.color
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

export const findFieldOnBoardByMoveVertices = (
    board: GoBoard,
    move: Field
): Field => {
    const boardField = board.fields.find(
        field =>
            field.vertex[0] === move.vertex[0] &&
            field.vertex[1] === move.vertex[1]
    )

    if (!boardField) {
        throw new Error('Move does not exist in board')
    }

    return boardField
}

export const getLiberties = (board: GoBoard, field: Field): Field[] => {
    const directNeighborFields = getDirectNeighborFields(board, field)

    return directNeighborFields.filter(
        field => field.color === PlayerColor.EMPTY
    )
}

export const getDirectNeighborFields = (
    board: GoBoard,
    field: Field
): Field[] => {
    const row = field.vertex[0]
    const col = field.vertex[1]
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
