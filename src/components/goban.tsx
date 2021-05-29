import React, { FC, useCallback, useState } from 'react'
import styled from 'styled-components'
import { withNewFieldColor } from '../lib/board'
import { chunk } from '../lib/utils'
import Tile from './tile'
import { PlayerColor, Vertex } from '../lib/types'
import { isOccupied, start } from '../lib/game'
import { createPlayer } from '../lib/player'

interface Props {
    size: number
}

const Board = styled.div``

const TileRow = styled.div`
    display: flex;
    flex-direction: row;
`
const Message = styled.div`
    height: 50px;
`
const Error = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%);
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 1;
    color: red;
`

const Captures = styled.div`
    height: 50px;
`

const Goban: FC<Props> = props => {
    const [game, setGame] = useState(
        start([
            createPlayer('a', PlayerColor.BLACK),
            createPlayer('b', PlayerColor.WHITE),
        ])
    )
    const [board, setBoard] = useState(game.fields)
    const [rows, setRows] = useState(chunk(game.fields, props.size))
    const [currentPlayer, setCurrentPlayer] = useState(PlayerColor.BLACK)
    const [error, setError] = useState<string | null>(null)

    const addErrorMessage = (message: string) => {
        setError(message)
        const timer = setTimeout(() => setError(null), 1000)
        return () => clearTimeout(timer)
    }

    const handleTileClick = useCallback(
        (vertex: Vertex) => {
            {
                if (isOccupied(game, vertex)) {
                    addErrorMessage('Field is occupied')
                    return
                }
                const newBoard = withNewFieldColor(board, vertex, currentPlayer)
                setBoard(newBoard)
                setRows(chunk(newBoard, props.size))
                setCurrentPlayer(
                    currentPlayer === PlayerColor.BLACK
                        ? PlayerColor.WHITE
                        : PlayerColor.BLACK
                )
            }
        },
        [board, currentPlayer, game, props.size]
    )

    return (
        <>
            <Message>
                {currentPlayer === PlayerColor.BLACK ? 'Schwarz' : 'Weiss'} am
                Zug
            </Message>
            <Board>
                {error && (
                    <Error>
                        <h4>{error}</h4>
                    </Error>
                )}
                {rows.map((rows, i) => (
                    <TileRow key={i}>
                        {rows.map((field, j) => (
                            <Tile
                                key={j}
                                // eslint-disable-next-line react/jsx-no-bind
                                clickHandler={() =>
                                    handleTileClick(field.vertex)
                                }
                                currentPlayer={currentPlayer}
                                field={field}
                            />
                        ))}
                    </TileRow>
                ))}
            </Board>
            <Captures>
                <p>White: 0</p>
                <p>Black: 1</p>
            </Captures>
        </>
    )
}

export default Goban
