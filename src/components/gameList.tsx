import React, { FC, useCallback, useEffect, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import styled, { keyframes } from 'styled-components'
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

// - TODO spacings,
// - statusicon grösser / neutraler,
// - heading datum switchen,
// - datum konstrast verringern und kleiner,
// - ort für id,
// - border gradient

const onGameHover = keyframes`
    0% {
        background-position: 0% 0%
    }
    100% {
        background-position: 100% 0%
    }
`
const onGameHoverOut = keyframes`
    0% {
        background-position: 100% 0%
    }
    100% {
        background-position: 0% 0%
    }
`

const GameCard = styled.div`
    & {
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: row;
        padding: 10px 32px 10px 20px;
        background: #414246;
        margin: 20px 0px;
        width: 350px;
    }
    &:after {
        content: '';
        position: absolute;
        background: linear-gradient(20deg, #e66465, #9198e5);
        width: calc(100% + 10px);
        height: calc(100% + 10px);
        background-size: 150%;
        z-index: -1;
        top: -5px;
        left: -5px;
        border-radius: 5px;
        animation: ${onGameHoverOut} 300ms ease-in 1 forwards;
    }

    &:hover:after {
        animation: ${onGameHover} 300ms ease-in 1 forwards;
    }
`

const GameDetails = styled.div`
    margin-left: 25px;
    justify-content: center;
    display: flex;
    flex-direction: column;
`
const GameId = styled.div`
    position: absolute;
    top: 10px;
    right: 15px;
    padding: 5px;
`
const NewGame = styled.div`
    display: flex-row;
`

const CreateGameButton = styled.button`
    background: linear-gradient(20deg, #e66465, #9198e5);
    color: white;
    padding: 14px 20px;
    margin: 8px 0px 8px 25px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-size: 150%;
`

const NewGameTitleField = styled.input`
    padding: 12px 20px;
    margin: 8px 0;
    flex-grow: 1;
    display: inline-block;
    border: 1px solid #ccc;
    justify-content: stretch;
    border-radius: 4px;
    box-sizing: border-box;
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
                    // eslint-disable-next-line no-console
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
                        // eslint-disable-next-line no-console
                        console.log(e)
                        setError('Fehler beim Spiel erstellen')
                        setLoading(false)
                    })
                setLocalGame(game)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    // eslint-disable-next-line no-console
                    console.log(e)
                    setError('Fehler beim Spiel erstellen')
                    setLoading(false)
                })
        }
    }, [gameTitle, games, localUser, setLocalGame])

    return (
        <>
            <h1>Games</h1>
            <NewGame>
                <NewGameTitleField
                    onChange={handleGameTitleInput}
                    placeholder="Name eingeben"
                />
                <CreateGameButton onClick={handleCreateGame}>
                    Create Game
                </CreateGameButton>
            </NewGame>
            {loading ? (
                <Spinner />
            ) : (
                games.map(game => {
                    return (
                        <GameCard
                            key={game.id}
                            // eslint-disable-next-line react/jsx-no-bind
                            onClick={() => handleGameSelect(game)}
                        >
                            <GameId>{game.id}</GameId>
                            <GameStatus>
                                {game.gameState === 0 ? (
                                    <FontAwesomeIcon
                                        color="#8b8683"
                                        icon="play-circle"
                                        size="2x"
                                    />
                                ) : game.gameState === 1 ? (
                                    <FontAwesomeIcon
                                        color="#8b8683"
                                        icon="hourglass-start"
                                        size="2x"
                                    />
                                ) : game.gameState === 2 ? (
                                    <FontAwesomeIcon
                                        color="#8b8683"
                                        icon="check-circle"
                                        size="2x"
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        color="#8b8683"
                                        icon="question"
                                        size="3x"
                                    />
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
                })
            )}

            {error && <p>{error}</p>}
            {games.length < 1 && <p>No games</p>}
        </>
    )
}

export default GameList
