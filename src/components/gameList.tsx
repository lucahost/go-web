import React, { FC, useCallback, useEffect, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import styled from 'styled-components'
import Spinner from './spinner'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCheckCircle,
    faHourglassHalf,
    faPlayCircle,
} from '@fortawesome/free-solid-svg-icons'

library.add(fab, faCheckCircle, faHourglassHalf, faPlayCircle)

const Table = styled.table`
    padding: 20px;
`

const TableHead = styled.th`
    text-align: left;
    padding-right: 50px;
`

const TableData = styled.td`
    text-align: left;
    padding-right: 50px;
`

// TODO spacings, statusicon grösser / neutraler, heading datum switchen, datum konstrast verringern und kleiner, ort für id, border gradient

const GameCard = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    // background: gray;
    padding: 10px 32px 10px 20px;
    margin: 10px 0px;
    border: white 1px solid;
    border-radius: 5px;
    width: 350px;
`

const GameDetails = styled.div`
    margin-left: 20px;
`
const GameId = styled.div`
    position: absolute;
    top: 0px;
    right: 15px;
    padding: 5px;
`

const GameStatus = styled.h2``

const GameTitle = styled.h2`
    margin: 0;
`
const GameDate = styled.h4`
    margin: 0;
`

const GameList: FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [gameTitle, setGameTitle] = useState<string>('')
    const [games, setGames] = useState<Game[]>([])

    useEffect(() => {
        if (localUser) {
            const url = `/api/games`
            axios
                .get<Game[]>(url)
                .then(r => {
                    if (r.status === 200) {
                        setGames(r.data)
                    }
                })
                .catch(e => {
                    console.log(e)
                    setGames([])
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localUser])

    const handleGameTitleInput = useCallback(
        event => setGameTitle(event.target.value),
        []
    )

    const handleGameSelect = useCallback(
        game => {
            if (game !== '' && localUser) {
                const url = `/api/games/${game.id}/join`
                setLoading(true)
                axios
                    .post<Game>(url, {
                        title: gameTitle,
                        userId: localUser.id,
                        subscription: localUser.subscription,
                    })
                    .then(r => {
                        if (r.status === 200) {
                            setGames([...games, r.data])
                            setLocalGame(r.data)
                        }
                        setError(null)
                        setLoading(false)
                    })
                    .catch(e => {
                        console.log(e)
                        setError('Fehler beim Spiel erstellen')
                        setLoading(false)
                    })
                setLocalGame(game)
            }
        },
        [setLocalGame]
    )

    const handleCreateGame = useCallback(() => {
        if (gameTitle !== '' && localUser) {
            const url = `/api/games`
            setLoading(true)
            axios
                .post<Game>(url, {
                    title: gameTitle,
                    userId: localUser.id,
                    subscription: localUser.subscription,
                })
                .then(r => {
                    if (r.status === 200) {
                        setGames([...games, r.data])
                        setLocalGame(r.data)
                    }
                    setError(null)
                    setLoading(false)
                })
                .catch(e => {
                    console.log(e)
                    setError('Fehler beim Spiel erstellen')
                    setLoading(false)
                })
        }
    }, [gameTitle, games, localUser, setLocalGame])

    return loading ? (
        <Spinner />
    ) : (
        <>
            <h1>Games</h1>
            {games.map(game => {
                return (
                    <GameCard key={game.id}>
                        <GameId>{game.id}</GameId>
                        <GameStatus>
                            {game.gameState === 0 ? (
                                <FontAwesomeIcon
                                    icon="play-circle"
                                    color="yellow"
                                />
                            ) : game.gameState === 1 ? (
                                <FontAwesomeIcon
                                    icon="hourglass-start"
                                    color="orange"
                                />
                            ) : game.gameState === 2 ? (
                                <FontAwesomeIcon
                                    icon="check-circle"
                                    color="gray"
                                />
                            ) : (
                                <FontAwesomeIcon icon="question" size="3x" />
                            )}
                        </GameStatus>
                        <GameDetails>
                            <GameTitle>{game.title}</GameTitle>
                            <GameDate>
                                {new Date(game.updatedAt).toLocaleString(
                                    'de-CH'
                                )}
                            </GameDate>
                        </GameDetails>
                    </GameCard>
                )
            })}
            <h1>Games</h1>
            {error && <p>{error}</p>}
            {games.length < 1 && <p>No games</p>}
            <Table>
                <tr>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Created</TableHead>
                </tr>
                {games.map(game => {
                    return (
                        <tr
                            key={game.id}
                            onClick={() => handleGameSelect(game)}
                        >
                            <TableData>{game.id}</TableData>
                            <TableData>{game.title}</TableData>
                            <TableData>
                                {game.gameState === 0 ? (
                                    <FontAwesomeIcon icon="play-circle" />
                                ) : game.gameState === 1 ? (
                                    <FontAwesomeIcon icon="hourglass-start" />
                                ) : game.gameState === 2 ? (
                                    <FontAwesomeIcon icon="check-circle" />
                                ) : (
                                    <FontAwesomeIcon icon="question" />
                                )}
                            </TableData>
                            <TableData>{game.createdAt}</TableData>
                        </tr>
                    )
                })}
            </Table>
            <span>
                <input
                    onChange={handleGameTitleInput}
                    placeholder="Name eingeben"
                />
                <button onClick={handleCreateGame}>Create Game</button>
            </span>
        </>
    )
}

export default GameList
