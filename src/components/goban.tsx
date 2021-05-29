import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { withNewFieldColor } from '../lib/board'
import { chunk } from '../lib/utils'
import Tile from './tile'
import { Game, GoBoard, PlayerColor, Vertex } from '../lib/types'
import { isOccupied, start } from '../lib/game'
import { createPlayer } from '../lib/player'
import axios from 'axios'
import useLocalStorage from '../lib/hooks/useLocalStorage'

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

const { log } = console

const Goban: FC<Props> = props => {
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)
    const [board, setBoard] = useState<GoBoard>(
        start([
            createPlayer('a', PlayerColor.BLACK),
            createPlayer('b', PlayerColor.WHITE),
        ])
    )
    const [fields, setFields] = useState(board.fields)
    const [rows, setRows] = useState(chunk(board.fields, props.size))
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
                if (isOccupied(board, vertex)) {
                    addErrorMessage('Field is occupied')
                    return
                }
                const newBoard = withNewFieldColor(
                    fields,
                    vertex,
                    currentPlayer
                )
                setFields(newBoard)
                setRows(chunk(newBoard, props.size))
                setCurrentPlayer(
                    currentPlayer === PlayerColor.BLACK
                        ? PlayerColor.WHITE
                        : PlayerColor.BLACK
                )
            }
        },
        [fields, currentPlayer, board, props.size]
    )

    const loadGame = useCallback(async () => {
        if (localGame) {
            const url = `/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status === 200) {
                        debugger
                        setLocalGame(r.data)
                        setBoard(r.data.board as GoBoard)
                    }
                })
                .catch(e => {
                    console.error(e)
                })
        }
    }, [])

    useEffect(() => {
        navigator.serviceWorker.addEventListener('message', event => {
            loadGame()
            log(event.data.msg, event.data.url)
        })
    }, [])

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
