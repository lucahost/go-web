export type GoBoard = {
    fields: Field[]
    history: Field[]
    captures: Field[]
    pass: boolean
    height: number
    width: number
}

export type User = {
    id: number
    email: string
    name?: string
    subscription?: string
}

export type Game = {
    id: number
    title: string
    createdAt: Date
    updatedAt: Date
    gameState: number
    author: User | null
    currentPlayer?: Player
    players?: Player[]
    board?: GoBoard | string
}

export type Player = {
    userId: number
    gameId: number
    playerColor: PlayerColor
}

export type Vertex = [number, number]

export type Field = {
    vertex: Vertex
    location: string
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
    WHITE_STONE = 'w',
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
