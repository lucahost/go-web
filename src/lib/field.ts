import { Field, PlayerColor, Vertex } from './types'

export const createField = (
    vertex: Vertex,
    color: PlayerColor = PlayerColor.EMPTY
): Field => ({
    vertex,
    color,
})
