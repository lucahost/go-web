/* eslint-disable react/jsx-no-bind */
import React, { FC, useCallback, useEffect, useState } from 'react'
import Goban from '../components/goban'
import styled from 'styled-components'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import Login from '../components/login'
import GameList from '../components/gameList'

const { log } = console

const Content = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    width: 100%;
`

const Link = styled.a`
    text-decoration: none;
    color: whitesmoke;
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
    cursor: pointer;
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    height: 100%;
`

const Logout = styled.h3`
    cursor: pointer;
    transition: color 0.3s ease-in-out;
    &:hover {
        color: #9198e5;
    }
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

const base64ToUint8Array = (base64: string) => {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(b64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

const HomePage: FC = () => {
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [registration, setRegistration] =
        useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            window.workbox !== undefined
        ) {
            // run only in browser
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (
                        sub &&
                        !(
                            sub.expirationTime &&
                            Date.now() > sub.expirationTime - 5 * 60 * 1000
                        )
                    ) {
                        setSubscription(sub)
                        setIsSubscribed(true)
                        if (localUser) {
                            setLocalUser({
                                ...localUser,
                                subscription: JSON.stringify(sub),
                            })
                        }
                    }
                })
                setRegistration(reg)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const onLogin = async () => {
            if (!localUser) {
                return
            }
            const sub = await registration?.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(
                    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? ''
                ),
            })

            setSubscription(sub ?? null)
            setIsSubscribed(true)
            setLocalUser({ ...localUser, subscription: JSON.stringify(sub) })

            log('web push subscribed!')
            log(sub)
        }

        if (localUser && localUser?.subscription === undefined) {
            onLogin()
        }
    }, [localUser, setLocalUser, registration?.pushManager])

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

    const handleLogout = async () => {
        await subscription?.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)
        setLocalUser(null)
        setLocalGame(null)
    }

    const handleNewGame = useCallback(() => {
        setLocalGame(null)
    }, [setLocalGame])

    const handlePass = useCallback(() => {
        if (localGame) {
            const url = `/api/games/${localGame.id}/pass`
            axios
                .post<Game>(url, { userId: localUser?.id })
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
    }, [setLocalGame, localGame])

    return (
        <>
            <Header>
                <h3>
                    <Link href="https://www.learn-go.net/" target="_blank">
                        Visit learn-go
                    </Link>
                </h3>
                <h1>Go</h1>
                <Logout>
                    {localUser && <a onClick={handleLogout}>Logout</a>}
                </Logout>
            </Header>
            <Content>
                {!localUser ? (
                    <Login />
                ) : localGame ? (
                    <>
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
