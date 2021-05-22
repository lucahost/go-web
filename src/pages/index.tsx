import React, { FC, useCallback, useEffect, useState } from 'react'
import Goban from '../components/goban'
import styled from 'styled-components'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'

const Content = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    width: 100%;
`

const Nav = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;

    height: 60px;
    width: 100%;
    padding: 5px 0;

    background-color: white;
`

const NavButton = styled.div`
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    height: 100%;
`

const HomePage: FC = () => {
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)

    const [games, setGames] = useState<Game[]>([])

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [gameTitle, setGameTitle] = useState<string>('')

    // if there is a user/game already in the local storage: check if it is still valid
    useEffect(() => {
        if (localUser) {
            const url = `http://localhost:3000/api/users/${localUser.id}`
            axios
                .get<User>(url)
                .then(r => {
                    if (r.status !== 200) {
                        setLocalUser(null)
                    }
                })
                .catch(e => {
                    console.log(e)
                    setLocalUser(null)
                })
        }
        if (localGame) {
            const url = `http://localhost:3000/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status !== 200) {
                        setLocalGame(null)
                    }
                })
                .catch(e => {
                    console.log(e)
                    setLocalGame(null)
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (localUser) {
            const url = `http://localhost:3000/api/games`
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

    const handleEmailInput = useCallback(
        event => setEmail(event.target.value),
        []
    )

    const handleNameInput = useCallback(
        event => setName(event.target.value),
        []
    )

    const handleGameTitleInput = useCallback(
        event => setGameTitle(event.target.value),
        []
    )

    const handleGameSelect = useCallback(
        game => {
            setLocalGame(game)
        },
        [setLocalGame]
    )

    const handleLogin = useCallback(() => {
        if (email !== '') {
            const url = `/api/users`
            setLoading(true)
            axios
                .post<User>(url, { name: name, email: email })
                .then(r => {
                    if (r.status === 200 || r.status === 201) {
                        setLocalUser(r.data)
                    }
                    setError(null)
                    setLoading(false)
                })
                .catch(e => {
                    console.log(e)
                    setError('Fehler bei Anmeldung')
                    setLoading(false)
                })
        }
    }, [email, name, setLocalUser])

    const handleLogout = useCallback(() => {
        setEmail('')
        setLocalUser(null)
        setLocalGame(null)
    }, [setLocalUser])

    const handleCreateGame = useCallback(() => {
        if (gameTitle !== '' && localUser) {
            console.log('handleCreateGame')

            const url = `/api/games`
            setLoading(true)
            axios
                .post<Game>(url, { title: gameTitle, userId: localUser.id })
                .then(r => {
                    if (r.status === 200) {
                        setGames([...games, r.data])
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
    }, [gameTitle, games, localUser])

    return (
        <>
            <Content>
                {loading ? (
                    <h1>Loading</h1>
                ) : !localUser ? (
                    <>
                        <h1>Bitte anmelden</h1>
                        {error && <p>{error}</p>}
                        <input
                            onChange={handleNameInput}
                            placeholder="Name eingeben"
                        />
                        <input
                            onChange={handleEmailInput}
                            placeholder="Email eingeben"
                        />
                        <button onClick={handleLogin}>Go</button>
                    </>
                ) : localGame ? (
                    <>
                        <h1>
                            Hello {localUser.name} (
                            <a onClick={handleLogout}>Logout</a>)
                        </h1>
                        <Goban size={9} />
                    </>
                ) : (
                    <>
                        <h1>Games</h1>
                        {error && <p>{error}</p>}
                        {games.length < 1 && <p>No games</p>}
                        {games.map(game => {
                            return (
                                <p
                                    key={game.id}
                                    onClick={() => handleGameSelect(game)}
                                >
                                    {game.title} {game.authorId}{' '}
                                    {game.createdAt} {game.updatedAt}
                                </p>
                            )
                        })}
                        <input
                            onChange={handleGameTitleInput}
                            placeholder="Name eingeben"
                        />
                        <button onClick={handleCreateGame}>Create Game</button>
                    </>
                )}
            </Content>
            <Nav>
                <NavButton>Neues Spiel</NavButton>
                <NavButton>Passen</NavButton>
            </Nav>
        </>
    )
}

/*
 * If you export an async function called getStaticProps from a page,
 * Next.js will pre-render this page at build time using the props
 * returned by getStaticProps.
 */
/*
export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}, // will be passed to the page component as props
    }
}
*/

/*
 * If a page has dynamic routes (documentation) and uses getStaticProps it
 * needs to define a list of paths that have to be rendered to HTML at build time.
 */
/*
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [], // determines which paths will be pre-rendered
    fallback: false, // any paths not returned by getStaticPaths will return 404
})
*/

/*
 * You should use getServerSideProps only if you need to pre-render
 * a page whose data must be fetched at request time.
 */
/*
export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {}, // will be passed to the page component as props
    }
}
*/

export default HomePage
