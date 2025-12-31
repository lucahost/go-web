import styled, { keyframes, css } from 'styled-components'
import { Field, FieldLocation, PlayerColor, Vertex } from '../lib/types'
import { memo, useCallback, useState } from 'react'

interface Props {
    field: Field
    location: FieldLocation
    clickHandler: (vertex: Vertex) => void
    currentPlayer?: PlayerColor
    userPlayer?: PlayerColor
    isNewlyPlaced?: boolean
    isLastMove?: boolean
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

const TileWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
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
    display: block;

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

const LastMoveMarker = styled.div<{ $color: PlayerColor }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 25%;
    height: 25%;
    border-radius: 50%;
    border: 1.5px solid
        ${({ $color }) =>
            $color === PlayerColor.BLACK
                ? 'rgba(255, 255, 255, 0.7)'
                : 'rgba(0, 0, 0, 0.6)'};
    pointer-events: none;
    z-index: 2;
`

const Tile = memo(
    ({
        field,
        location,
        clickHandler,
        currentPlayer,
        userPlayer,
        isNewlyPlaced,
        isLastMove,
        isBeingCaptured,
    }: Props) => {
        const [isHover, setIsHover] = useState(false)

        const handleMouseEnter = useCallback(() => {
            if (currentPlayer === userPlayer) {
                setIsHover(true)
            }
        }, [currentPlayer, userPlayer])

        const handleMouseLeave = useCallback(() => {
            setIsHover(false)
        }, [])

        const handleClick = useCallback(() => {
            clickHandler(field.vertex)
        }, [clickHandler, field.vertex])

        const showLastMoveMarker =
            isLastMove && field.color !== PlayerColor.EMPTY

        return (
            <TileWrapper>
                <TileContainer
                    $isBeingCaptured={isBeingCaptured}
                    $isNewlyPlaced={isNewlyPlaced}
                    alt={`Go board tile at ${field.vertex[0]},${field.vertex[1]}`}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
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
                {showLastMoveMarker && <LastMoveMarker $color={field.color} />}
            </TileWrapper>
        )
    }
)

export default Tile
