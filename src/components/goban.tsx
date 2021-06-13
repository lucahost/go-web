import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { chunk } from '../lib/utils'
import Tile from './tile'
import { Game, GoBoard, Player, PlayerColor, User, Vertex } from '../lib/types'
import { isOccupied, isSuicide } from '../lib/game'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [currentPlayer, setCurrentPlayer] = useState<Player>()
    const [userPlayer, setUserPlayer] = useState<Player>()
    const [board, setBoard] = useState<GoBoard>()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fields, setFields] = useState(board?.fields)
    const [rows, setRows] = useState(chunk(board?.fields ?? [], props.size))

    const [error, setError] = useState<string | null>(null)

    const addErrorMessage = (message: string) => {
        setError(message)
        const timer = setTimeout(() => setError(null), 1000)
        return () => clearTimeout(timer)
    }

    useEffect(() => {
        if (localGame && localUser) {
            const userPlayer = localGame.players?.find(
                u => u.userId === localUser.id
            )
            setUserPlayer(userPlayer)
        }
    }, [localUser, localGame])

    const loadGame = useCallback(async () => {
        if (localGame) {
            const url = `/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status === 200) {
                        setLocalGame(r.data)
                        setBoard(r.data.board as GoBoard)
                        if (r.data.board !== '') {
                            const board = r.data.board as GoBoard
                            setCurrentPlayer(r.data.currentPlayer)
                            setBoard(board)
                            setFields(board.fields)
                            setRows(chunk(board?.fields, props.size))
                        }
                    }
                })
                .catch(e => {
                    console.error(e)
                })
        }
    }, [localGame, props.size, setLocalGame])

    const handleTileClick = useCallback(
        (vertex: Vertex) => {
            {
                if (currentPlayer?.playerColor != userPlayer?.playerColor) {
                    addErrorMessage('Not your turn')
                    return
                }
                if (!board || isOccupied(board, vertex)) {
                    addErrorMessage('Field is occupied')
                    return
                }
                if (
                    !currentPlayer ||
                    !board ||
                    isSuicide(board, vertex, currentPlayer.playerColor)
                ) {
                    addErrorMessage('Suicide')
                    return
                }
                if (localGame) {
                    const url = `/api/games/${localGame.id}/moves`
                    axios
                        .post<Game>(url, {
                            vertex,
                            userId: localUser?.id,
                        })
                        .then(async r => {
                            if (r.status === 200) {
                                // eslint-disable-next-line no-debugger
                                await loadGame()
                            }
                        })
                }
            }
        },
        [
            currentPlayer,
            userPlayer?.playerColor,
            board,
            localGame,
            localUser?.id,
            loadGame,
        ]
    )

    useEffect(() => {
        // run only in browser
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            window.workbox !== undefined
        ) {
            navigator.serviceWorker.addEventListener('message', event => {
                loadGame()
                log(event.data.msg, event.data.url)
            })
        }

        loadGame()
    }, [])

    return (
        <>
            <h1>{localGame?.title}</h1>
            {(localGame?.board as GoBoard).pass && <h2>PASS</h2>}
            <Message>
                {userPlayer?.playerColor === currentPlayer?.playerColor
                    ? `Du bist am Zug (${
                          userPlayer?.playerColor === PlayerColor.BLACK
                              ? 'Schwarz'
                              : 'Weiss'
                      })`
                    : `Gegner am Zug (${
                          currentPlayer?.playerColor === PlayerColor.BLACK
                              ? 'Schwarz'
                              : 'Weiss'
                      })`}
            </Message>
            <Board>
                {error && (
                    <Error>
                        <h4>{error}</h4>
                    </Error>
                )}
                {rows.map((rows, i) => (
                    <TileRow key={i}>
                        {currentPlayer &&
                            rows.map((field, j) => (
                                <Tile
                                    key={j}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    clickHandler={() =>
                                        handleTileClick(field.vertex)
                                    }
                                    currentPlayer={currentPlayer?.playerColor}
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
