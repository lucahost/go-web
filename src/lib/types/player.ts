export enum PlayerColor {
    BLACK = 'Black',
    WHITE = 'White',
}

export interface Player {
    color: PlayerColor
    name: string
}
