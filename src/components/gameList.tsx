import React, { FC, useCallback, useEffect, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import styled from 'styled-components'
import Spinner from './spinner'

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
                                {game.gameState === 0
                                    ? 'Initialized'
                                    : game.gameState === 1
                                    ? 'Running'
                                    : game.gameState === 2
                                    ? 'Ended'
                                    : 'Unknown'}
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
