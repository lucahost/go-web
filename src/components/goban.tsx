import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { chunk } from '../lib/utils'
import Tile from './tile'
import {
    Field,
    FieldLocation,
    Game,
    GameState,
    GoBoard,
    Player,
    PlayerColor,
    User,
} from '../lib/types'
import { isKo, isOccupied, isSuicide } from '../lib/game'
import axios from 'axios'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { getFieldLocationByVertex } from '../lib/board'
import useSoundEffect from '../lib/hooks/useSoundEffect'

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
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [clickSound] = useSoundEffect('click.mp3')

    const [currentPlayer, setCurrentPlayer] = useState<Player>()
    const [userPlayer, setUserPlayer] = useState<Player>()
    const [board, setBoard] = useState<GoBoard>()
    const [whiteCaptures, setWhiteCaptures] = useState<number>(0)
    const [blackCaptures, setBlackCaptures] = useState<number>(0)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const loadGame = async () => {
        if (localGame) {
            const url = `/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status === 200) {
                        setLocalGame(r.data)
                        setBoard(r.data.board as GoBoard)
                        if (
                            r.data.board !== '' &&
                            r.data.currentPlayer !== null
                        ) {
                            const board = r.data.board as GoBoard
                            const currentPlayer = r.data.currentPlayer as Player
                            setCurrentPlayer(currentPlayer)
                            setBoard(board)
                            setRows(chunk(board.fields, props.size))
                            setWhiteCaptures(
                                board.captures.filter(
                                    field => field.color === PlayerColor.WHITE
                                ).length
                            )
                            setBlackCaptures(
                                board.captures.filter(
                                    field => field.color === PlayerColor.BLACK
                                ).length
                            )
                        }
                    }
                })
                .catch(e => {
                    // eslint-disable-next-line no-console
                    console.error(e)
                })
        }
    }

    const handleTileClick = useCallback(
        (field: Field) => {
            {
                if (localGame?.gameState === GameState.ENDED) {
                    addErrorMessage('Game finished')
                    return
                }
                if (currentPlayer?.playerColor != userPlayer?.playerColor) {
                    addErrorMessage('Not your turn')
                    return
                }
                if (!board || isOccupied(board, field.vertex)) {
                    addErrorMessage('Field is occupied')
                    return
                }
                if (
                    !currentPlayer ||
                    !board ||
                    isSuicide(board, field.vertex, currentPlayer.playerColor)
                ) {
                    addErrorMessage('Suicide')
                    return
                }
                if (
                    currentPlayer &&
                    board &&
                    isKo(board, {
                        vertex: field.vertex,
                        color: currentPlayer.playerColor,
                    })
                ) {
                    addErrorMessage('Infinity / Ko')
                    return
                }
                clickSound()
                if (localGame) {
                    const url = `/api/games/${localGame.id}/moves`
                    axios
                        .post<Game>(url, {
                            field: {
                                ...field,
                                color: currentPlayer.playerColor,
                            },
                            userId: localUser?.id,
                        })
                        .then(async r => {
                            if (r.status === 200) {
                                await loadGame()
                            }
                        })
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // run only in browser
            navigator.serviceWorker.addEventListener('message', loadGame, true)
        }
        loadGame()

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener(
                    'message',
                    loadGame,
                    true
                )
            }
        }
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <h1>{localGame?.title}</h1>
            {userPlayer?.playerColor === currentPlayer?.playerColor &&
                (localGame?.board as GoBoard)?.pass && (
                    <h2>Der andere Spieler hat gepasst</h2>
                )}

            {localGame?.gameState === GameState.RUNNING && (
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
            )}

            {localGame?.gameState === GameState.ENDED && (
                <Message>GAME OVER</Message>
            )}

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
                                    clickHandler={() => handleTileClick(field)}
                                    currentPlayer={currentPlayer?.playerColor}
                                    field={field}
                                    location={
                                        field.color === PlayerColor.EMPTY
                                            ? getFieldLocationByVertex(
                                                  field.vertex,
                                                  props.size
                                              )
                                            : field.color === PlayerColor.BLACK
                                              ? FieldLocation.BLACK_STONE
                                              : FieldLocation.WHITE_STONE
                                    }
                                    userPlayer={userPlayer?.playerColor}
                                />
                            ))}
                    </TileRow>
                ))}
            </Board>
            <Captures>
                <p>{`White: ${whiteCaptures}`}</p>
                <p>{`Black: ${blackCaptures}`}</p>
            </Captures>
        </>
    )
}

export default Goban
