import styled from 'styled-components'
import { Field, PlayerColor, Vertex } from '../lib/types'
import { memo, useState } from 'react'

interface Props {
    field: Field
    clickHandler: (vertex: Vertex) => void
    currentPlayer: PlayerColor
}

const TileContainer = styled.img`
    height: 50px;
    width: 50px;
`

const Tile = memo(({ field, clickHandler, currentPlayer }: Props) => {
    const [isHover, setIsHover] = useState(false)

    return (
        <TileContainer
            // TODO: should not use arrow functions
            onClick={() => clickHandler(field.vertex)}
            onMouseEnter={() => {
                setIsHover(true)
            }}
            onMouseLeave={() => {
                setIsHover(false)
            }}
            src={`/Go_${
                isHover
                    ? currentPlayer == PlayerColor.BLACK
                        ? 'bh'
                        : 'wh'
                    : field.location
            }.svg`}
        />
    )
})

export default Tile
