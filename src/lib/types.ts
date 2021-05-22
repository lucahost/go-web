export type GoBoard = {
    identifier: string
    fields: Field[]
    currentPlayer: Player
    players: [Player, Player]
    history: Field[]
    captures: Field[]
    status: GameState
    pass: boolean
    height: number
    width: number
}

export type User = {
    id: number
    email: string
    name?: string
}

export type Game = {
    id: number
    title: string
    createdAt: Date
    updatedAt: Date
    authorId: number | null
}

export type Player = {
    identifier: string
    name: string
    color: PlayerColor
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
