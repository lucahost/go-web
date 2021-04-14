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

export type Player = {
    identifier: string
    name: string
    color: PlayerColor
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

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}
