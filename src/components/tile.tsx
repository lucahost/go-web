import styled from 'styled-components'
import { Field, PlayerColor, Vertex } from '../lib/types'
import { memo, useState } from 'react'

interface Props {
    field: Field
    clickHandler: (vertex: Vertex) => void
    currentPlayer?: PlayerColor
    userPlayer?: PlayerColor
}

const TileContainer = styled.img`
    height: 50px;
    width: 50px;
`

const Tile = memo(
    ({ field, clickHandler, currentPlayer, userPlayer }: Props) => {
        const [isHover, setIsHover] = useState(false)

        return (
            <TileContainer
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => clickHandler(field.vertex)}
                // eslint-disable-next-line react/jsx-no-bind
                onMouseEnter={() => {
                    if (currentPlayer === userPlayer) {
                        setIsHover(true)
                    }
                }}
                // eslint-disable-next-line react/jsx-no-bind
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
    }
)

export default Tile
