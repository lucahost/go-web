import styled, { keyframes, css } from 'styled-components'
import { Field, FieldLocation, PlayerColor, Vertex } from '../lib/types'
import { memo, useState } from 'react'

interface Props {
    field: Field
    location: FieldLocation
    clickHandler: (vertex: Vertex) => void
    currentPlayer?: PlayerColor
    userPlayer?: PlayerColor
    isNewlyPlaced?: boolean
    isBeingCaptured?: boolean
}

const stonePlaceAnimation = keyframes`
    0% {
        transform: scale(0.5);
        opacity: 0.7;
    }
    70% {
        transform: scale(1.08);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
`

const stoneCaptureAnimation = keyframes`
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0);
        opacity: 0;
    }
`

const TileContainer = styled.img<{
    $isNewlyPlaced?: boolean
    $isBeingCaptured?: boolean
}>`
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: transform 0.1s ease;
    user-select: none;
    -webkit-user-drag: none;

    &:active {
        transform: scale(0.95);
    }

    ${({ $isNewlyPlaced }) =>
        $isNewlyPlaced &&
        css`
            animation: ${stonePlaceAnimation} 0.25s ease-out forwards;
        `}

    ${({ $isBeingCaptured }) =>
        $isBeingCaptured &&
        css`
            animation: ${stoneCaptureAnimation} 0.3s ease-in forwards;
        `}
`

const Tile = memo(
    ({
        field,
        location,
        clickHandler,
        currentPlayer,
        userPlayer,
        isNewlyPlaced,
        isBeingCaptured,
    }: Props) => {
        const [isHover, setIsHover] = useState(false)

        return (
            <TileContainer
                $isNewlyPlaced={isNewlyPlaced}
                $isBeingCaptured={isBeingCaptured}
                alt={`Go board tile at ${field.vertex[0]},${field.vertex[1]}`}
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
                    isHover &&
                    currentPlayer === userPlayer &&
                    field.color === PlayerColor.EMPTY
                        ? userPlayer == PlayerColor.BLACK
                            ? FieldLocation.BLACK_STONE_HOVER
                            : FieldLocation.WHITE_STONE_HOVER
                        : location
                }.svg`}
            />
        )
    }
)

export default Tile
