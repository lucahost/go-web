import styled from 'styled-components'
import { Field, FieldLocation, PlayerColor, Vertex } from '../lib/types'
import { memo, useState } from 'react'

interface Props {
    field: Field
    location: FieldLocation
    clickHandler: (vertex: Vertex) => void
    currentPlayer?: PlayerColor
    userPlayer?: PlayerColor
}

const TileContainer = styled.img`
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: transform 0.1s ease;
    user-select: none;
    -webkit-user-drag: none;

    &:active {
        transform: scale(0.95);
    }
`

const Tile = memo(
    ({ field, location, clickHandler, currentPlayer, userPlayer }: Props) => {
        const [isHover, setIsHover] = useState(false)

        return (
            <TileContainer
                src={`/Go_${
                    isHover
                        ? currentPlayer == PlayerColor.BLACK
                            ? FieldLocation.BLACK_STONE_HOVER
                            : FieldLocation.WHITE_STONE_HOVER
                        : location
                }.svg`}
                alt={`Go board tile at ${field.vertex[0]},${field.vertex[1]}`}
                // eslint-disable-next-line react/jsx-no-bind
                onMouseLeave={() => {
                    setIsHover(false)
                }}
                onClick={() => clickHandler(field.vertex)}
                // eslint-disable-next-line react/jsx-no-bind
                onMouseEnter={() => {
                    if (currentPlayer === userPlayer) {
                        setIsHover(true)
                    }
                }}
            />
        )
    }
)

export default Tile
