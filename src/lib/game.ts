import { Field, Game, GameState, GoBoard } from './types'
import {
    addHistory,
    generateBoardLayout,
    handleCapture,
    resetPass,
    setStone,
    switchPlayer,
} from './board'
import { isInBounds, isKo, isOccupied, isSuicide } from './rules'

export const start = (): GoBoard => {
    const width = 9
    const height = 9

    return {
        status: GameState.INITIALIZED,
        captures: [],
        fields: generateBoardLayout(width),
        height,
        currentPlayer: null, // Set when BLACK player joins via /join endpoint
        history: [],
        identifier: '',
        pass: false,
        width,
    }
}

export const move = (game: Game, move: Field): GoBoard => {
    let board = game.board as GoBoard
    if (typeof game.board === 'string') {
        board = JSON.parse(game.board) as GoBoard
    }

    if (game.players == undefined) {
        throw 'no players on game'
    }

    if (!isInBounds(board, move)) {
        // Check if move is in bounds
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
    // Handle capture
    board = handleCapture(board, move.vertex, move.color)

    // Add move to fields
    board = setStone(board, move)

    // Switch current player
    board = switchPlayer(board, game.players)

    // Reset passes on players if not a double-pass
    board = resetPass(board)
    // Add history
    board = addHistory(board, move)

    // Change state to running
    return { ...board, status: GameState.RUNNING }
}

export const pass = (game: Game, board: GoBoard, userId: number): GoBoard => {
    // Validate that the user attempting to pass is the current player
    if (!board.currentPlayer) {
        throw new Error('Cannot pass: no current player set')
    }
    if (board.currentPlayer.userId !== userId) {
        throw new Error('Cannot pass: it is not your turn')
    }

    if (board.pass) {
        // Double pass ends the game
        game.gameState = GameState.ENDED
        return { ...board, pass: false, currentPlayer: null }
    } else {
        // Single pass: switch to the other player
        if (!game.players || game.players.length !== 2) {
            throw new Error('Cannot pass: game requires exactly 2 players')
        }
        const updatedBoard = switchPlayer(board, game.players)
        return { ...updatedBoard, pass: true }
    }
}

export const end = (): void => {
    return
}
