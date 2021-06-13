import { Field, Game, GameState, GoBoard, PlayerColor, Vertex } from './types'
import { generateBoardLayout } from './board'

export const start = (): GoBoard => {
    const width = 9
    const height = 9

    return {
        status: GameState.INITIALIZED,
        captures: [],
        fields: generateBoardLayout(width),
        height,
        currentPlayer: {
            playerColor: PlayerColor.BLACK,
            gameId: 0,
            userId: 1,
        },
        history: [],
        identifier: '',
        pass: false,
        width,
    }
}

export const move = (game: Game, move: Field): GoBoard => {
    let board = game.board as GoBoard
    // Check if move is in bounds
    if (!isInBounds(board, move)) {
        throw new Error(`Move on location ${move.vertex} is out of bounds`)
    }
    // Check if the color of the move matches the current players color
    if (board?.currentPlayer?.playerColor !== move.color) {
        throw new Error(`current player is not ${move.color}`)
    }

    if (isOccupied(board, move.vertex)) {
        throw new Error(
            `Move on location ${
                move.vertex
            } is not possible. Already occupied. Fields ${board.fields.map(
                f => `${f.vertex}, `
            )}`
        )
    }
    if (isSuicide(board, move.vertex, move.color)) {
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
    board = switchPlayer(game)

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

export const isOccupied = (board: GoBoard, vertex: Vertex): boolean => {
    if (board.fields.length == 0) return false

    return findFieldOnBoardByVertex(board, vertex).color !== PlayerColor.EMPTY
}

export const isSuicide = (
    board: GoBoard,
    vertex: Vertex,
    playerColor: PlayerColor | string
): boolean => {
    // Check Liberties on Stone
    // Should be done recursively - Big Boundaries
    const libs = getLiberties(board, vertex)
    // Get direct neighbors of stone
    const directNeighborFields = getDirectNeighborFields(board, vertex)
    // Suicide: zero liberties and no direct neighbor is of my color
    return (
        libs.length === 0 &&
        directNeighborFields.filter(field => field.color === playerColor)
            .length === 0
    )
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
    const boardField = findFieldOnBoardByVertex(board, move.vertex)
    boardField.color = move.color
    return board
}

export const switchPlayer = (game: Game): GoBoard => {
    const board = game.board as GoBoard

    if (game?.players?.length !== 2) {
        throw new Error('Incorrect count of players in game')
    }

    const nextPlayer = game?.players?.find(
        p => p.userId !== game?.currentPlayer?.userId
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
