import {
    Field,
    Game,
    GameState,
    GoBoard,
    Player,
    PlayerColor,
    Vertex,
} from './types'
import { generateBoardLayout, withNewFieldColor } from './board'
import { withoutDuplicates } from './utils'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isKo = (board: GoBoard, move: Field): boolean => {
    // if board would look the same after performing the move
    // return true
    // else
    return false
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

const getOppositeColor = (color: PlayerColor) =>
    color === PlayerColor.BLACK ? PlayerColor.WHITE : PlayerColor.BLACK

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

const getNewUniqueFields = (fields: Field[], newFields: Field[]): Field[] => {
    const newUniqueFields: Field[] = []
    for (const newField of newFields) {
        if (!fields.includes(newField)) {
            newUniqueFields.push(newField)
        }
    }
    return newUniqueFields
}

const getDirectNeighborFieldsOfOppositeColor = (
    board: GoBoard,
    vertex: Vertex,
    playerColor: PlayerColor
): Field[] =>
    getDirectNeighborFields(board, vertex).filter(
        field => field.color === getOppositeColor(playerColor)
    )

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
