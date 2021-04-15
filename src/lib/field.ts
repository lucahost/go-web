import { Field, PlayerColor, Vertex } from './types'

export const createField = (
    vertex: Vertex,
    location: string,
    color: PlayerColor = PlayerColor.EMPTY
): Field => ({
    vertex,
    location,
    color,
})
