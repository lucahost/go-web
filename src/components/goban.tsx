import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
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
import { media } from '../lib/theme'

interface Props {
    size: number
}

const GobanContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
`

const GameTitle = styled.h1`
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    text-align: center;

    ${media.md} {
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
`

const PassNotice = styled.h2`
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.secondary};
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    text-align: center;
`

const BoardWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: min(90vw, 450px);
    aspect-ratio: 1;
`

const Board = styled.div<{ $size: number }>`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(${({ $size }) => $size}, 1fr);
    grid-template-rows: repeat(${({ $size }) => $size}, 1fr);
`

const Message = styled.div`
    min-height: 40px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-align: center;
    padding: ${({ theme }) => theme.spacing.sm};

    ${media.md} {
        font-size: ${({ theme }) => theme.typography.fontSize.base};
        min-height: 50px;
    }
`

const Error = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 255, 255, 0.95);
    z-index: 10;
    color: ${({ theme }) => theme.colors.error};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    text-align: center;

    h4 {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
`

const Captures = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    max-width: 300px;
    padding: ${({ theme }) => theme.spacing.md};

    p {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
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
        <GobanContainer>
            <GameTitle>{localGame?.title}</GameTitle>
            {userPlayer &&
                currentPlayer &&
                userPlayer.playerColor === currentPlayer.playerColor &&
                (localGame?.board as GoBoard)?.pass && (
                    <PassNotice>Der andere Spieler hat gepasst</PassNotice>
                )}

            {localGame?.gameState === GameState.RUNNING &&
                currentPlayer &&
                userPlayer && (
                    <Message>
                        {userPlayer.playerColor === currentPlayer.playerColor
                            ? `Du bist am Zug (${
                                  userPlayer.playerColor === PlayerColor.BLACK
                                      ? 'Schwarz'
                                      : 'Weiss'
                              })`
                            : `Gegner am Zug (${
                                  currentPlayer.playerColor ===
                                  PlayerColor.BLACK
                                      ? 'Schwarz'
                                      : 'Weiss'
                              })`}
                    </Message>
                )}

            {localGame?.gameState === GameState.ENDED && (
                <Message>GAME OVER</Message>
            )}

            <BoardWrapper>
                <Board $size={props.size}>
                    {error && (
                        <Error>
                            <h4>{error}</h4>
                        </Error>
                    )}
                    {board?.fields &&
                        currentPlayer &&
                        board.fields.map((field, i) => (
                            <Tile
                                key={i}
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
                </Board>
            </BoardWrapper>
            <Captures>
                <p>{`Weiss: ${whiteCaptures}`}</p>
                <p>{`Schwarz: ${blackCaptures}`}</p>
            </Captures>
        </GobanContainer>
    )
}

export default Goban
