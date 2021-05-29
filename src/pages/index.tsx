import React, { FC, useCallback, useEffect } from 'react'
import Goban from '../components/goban'
import styled from 'styled-components'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import Login from '../components/login'
import GameList from '../components/gameList'
import Spinner from '../components/spinner'

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

const Header = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;

    background-color: #252525;

    width: 100%;
    height: 50px;
    padding: 0 20px;
`

const HomePage: FC = () => {
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)

    // if there is a user/game already in the local storage: check if it is still valid
    useEffect(() => {
        if (localUser) {
            const url = `/api/users/${localUser.id}`
            axios
                .get<User>(url)
                .then(r => {
                    if (r.status !== 200) {
                        setLocalUser(null)
                    }
                })
                .catch(() => {
                    setLocalUser(null)
                })
        }
        if (localGame) {
            const url = `/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status !== 200) {
                        setLocalGame(null)
                    }
                })
                .catch(() => {
                    setLocalGame(null)
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleLogout = useCallback(() => {
        setLocalUser(null)
        setLocalGame(null)
    }, [setLocalGame, setLocalUser])

    const handleNewGame = useCallback(() => {
        setLocalGame(null)
    }, [setLocalGame])

    const handlePass = useCallback(() => {
        setLocalGame(null)
    }, [setLocalGame])

    return (
        <>
            <Header>
                <h1>Go</h1>
                {localUser && (
                    <h3>
                        <a onClick={handleLogout}>Logout</a>
                    </h3>
                )}
            </Header>
            <Content>
                {!localUser ? (
                    <Login />
                ) : localGame ? (
                    <>
                        <h1>Hello {localUser.name}</h1>
                        <Goban size={9} />
                    </>
                ) : (
                    <GameList />
                )}
            </Content>
            {localUser && localGame && (
                <Nav>
                    <NavButton onClick={handleNewGame}>Neues Spiel</NavButton>
                    <NavButton onClick={handlePass}>Passen</NavButton>
                </Nav>
            )}
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
