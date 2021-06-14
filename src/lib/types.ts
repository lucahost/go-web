import { UserGame } from '@prisma/client'

export type GoBoard = {
    status: GameState
    fields: Field[]
    history: Field[]
    captures: Field[]
    identifier: string
    currentPlayer: Player | UserGame | null
    pass: boolean
    height: number
    width: number
}

export type User = {
    id: number
    email: string
    name: string | null
    subscription?: string
}

export type Game = {
    id: number
    title: string
    createdAt: Date
    updatedAt: Date
    gameState: number
    author: User | null
    currentPlayer: Player | UserGame | null
    players?: Player[]
    board?: GoBoard | string
}

export type Player = {
    userId: number
    gameId: number
    playerColor: PlayerColor | number
}

export type Vertex = [number, number]

export type Field = {
    vertex: Vertex
    color: PlayerColor
}

export enum GameState {
    INITIALIZED,
    RUNNING,
    ENDED,
    ERROR = 99,
}

export enum PlayerColor {
    WHITE = -1,
    EMPTY = 0,
    BLACK = 1,
}

export enum FieldLocation {
    BLACK_STONE = 'b',
    BLACK_STONE_HOVER = 'bh',
    WHITE_STONE = 'w',
    WHITE_STONE_HOVER = 'wh',
    MARKER = '-',
    MIDDLE = 'm',
    DOWN = 'd',
    DOWN_LEFT = 'dl',
    DOWN_RIGHT = 'dr',
    LEFT = 'l',
    RIGHT = 'r',
    UP = 'u',
    UP_LEFT = 'ul',
    UP_RIGHT = 'ur',
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}
