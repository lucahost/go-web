import React, { FC, useCallback, useEffect, useState } from 'react'
import Goban from '../components/goban'
import styled from 'styled-components'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, GameState, User } from '../lib/types'
import axios from 'axios'
import Login from '../components/login'
import GameList from '../components/gameList'
import { media } from '../lib/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

const { log } = console

const Content = styled.main`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    ${media.md} {
        justify-content: center;
        padding: ${({ theme }) => theme.spacing.xl};
    }
`

const Link = styled.a`
    text-decoration: none;
    color: whitesmoke;
    padding: ${({ theme }) => theme.spacing.sm};
    min-height: ${({ theme }) => theme.touchTarget.minimum};
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
`

const Nav = styled.nav`
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    min-height: 60px;
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
    padding-bottom: max(
        ${({ theme }) => theme.spacing.sm},
        env(safe-area-inset-bottom)
    );
    background-color: ${({ theme }) => theme.colors.white};
`

const NavButton = styled.button`
    cursor: pointer;
    color: ${({ theme }) => theme.colors.surface};
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    min-width: ${({ theme }) => theme.touchTarget.comfortable};
    min-height: ${({ theme }) => theme.touchTarget.comfortable};
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: 500;
    font-family: inherit;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    transition:
        background-color 0.2s ease,
        opacity 0.2s ease;

    &:active {
        background-color: rgba(0, 0, 0, 0.05);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
    }
`

const Logout = styled.button`
    cursor: pointer;
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-family: inherit;
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
    min-height: ${({ theme }) => theme.touchTarget.minimum};
    transition: color 0.3s ease-in-out;

    &:hover,
    &:active {
        color: ${({ theme }) => theme.colors.secondary};
    }
`

const Header = styled.header`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.surface};
    width: 100%;
    min-height: 56px;
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};

    ${media.md} {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        padding: 0 ${({ theme }) => theme.spacing.lg};
        height: 60px;
    }
`

const HeaderLeft = styled.div`
    display: none;

    ${media.md} {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    h3 {
        margin: 0;
    }
`

const HeaderCenter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    h1 {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.xl};

        ${media.md} {
            font-size: ${({ theme }) => theme.typography.fontSize.xxl};
        }
    }
`

const HeaderRight = styled.div`
    position: absolute;
    right: ${({ theme }) => theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);

    ${media.md} {
        position: static;
        transform: none;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    h3 {
        margin: 0;
    }
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
    const [gameId, setGameId] = useLocalStorage<number | null>('gameId', null)
    const [game, setGame] = useState<Game | null>(null)
    const [, setSavedUsername] = useLocalStorage<string | null>(
        'savedUsername',
        null
    )

    const [, setIsSubscribed] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [registration, setRegistration] =
        useState<ServiceWorkerRegistration | null>(null)
    const [isPassing, setIsPassing] = useState(false)
    const [passMessage, setPassMessage] = useState<string | null>(null)
    const isPassingRef = React.useRef(false)
    const isMyTurn = game?.currentPlayer?.userId === localUser?.id

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('Service worker registration failed:', err)
            })

            // Wait for service worker to be ready
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
                        if (localUser && !localUser.subscription) {
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
    }, [setLocalUser])

    useEffect(() => {
        if (gameId) {
            axios
                .get<Game>(`/api/games/${gameId}`)
                .then(r => {
                    if (r.status === 200) {
                        setGame(r.data)
                    }
                })
                .catch(() => {
                    setGame(null)
                    setGameId(null) // Clear invalid gameId
                })
        } else {
            setGame(null)
        }
    }, [gameId, setGameId])

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

            // Register global subscription for new game notifications
            if (sub) {
                axios
                    .post('/api/subscriptions', {
                        userId: localUser.id,
                        subscription: JSON.stringify(sub),
                        isGlobal: true,
                    })
                    .catch(err => {
                        console.error(
                            'Failed to register global subscription:',
                            err
                        )
                    })
            }

            log('web push subscribed!')
            log(sub)
        }

        if (localUser && localUser?.subscription === undefined) {
            onLogin()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localUser?.subscription, registration?.pushManager, setLocalUser])

    // if there is a user/game already in the local storage: check if it is still valid
    useEffect(() => {
        if (localUser?.id) {
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
        if (gameId) {
            const url = `/api/games/${gameId}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status !== 200) {
                        setGameId(null)
                    }
                })
                .catch(() => {
                    setGameId(null)
                })
        }
    }, [localUser?.id, gameId, setLocalUser, setGameId])

    // Listen for service worker messages about deleted games
    useEffect(() => {
        const handleServiceWorkerMessage = (event: globalThis.MessageEvent) => {
            const { type, data } = event.data || {}

            if (type === 'GAME_DELETED') {
                const deletedGameId = data?.data?.gameId
                if (deletedGameId && gameId === deletedGameId) {
                    setGameId(null)
                    setGame(null)
                }
            }
        }

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener(
                'message',
                handleServiceWorkerMessage
            )
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener(
                    'message',
                    handleServiceWorkerMessage
                )
            }
        }
    }, [gameId, setGameId])

    const handleLogout = useCallback(async () => {
        // Save username before logout
        if (localUser?.name) {
            setSavedUsername(localUser.name)
        }
        await subscription?.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)
        setLocalUser(null)
        setGameId(null)
    }, [
        localUser?.name,
        subscription,
        setSavedUsername,
        setLocalUser,
        setGameId,
    ])

    const handleNewGame = useCallback(() => {
        setGameId(null)
    }, [setGameId])

    const handlePass = useCallback(async () => {
        if (gameId && game && !isPassingRef.current) {
            // Prevent pass if it's not the user's turn
            if (game.currentPlayer?.userId !== localUser?.id) {
                setPassMessage('Warte auf den anderen Spieler')
                setTimeout(() => setPassMessage(null), 2000)
                return
            }

            isPassingRef.current = true
            setIsPassing(true)
            const url = `/api/games/${gameId}/pass`
            try {
                const r = await axios.post<Game>(url, {
                    userId: localUser?.id,
                })
                if (r.status === 200) {
                    // Fetch updated game state after successful pass
                    const gameResponse = await axios.get(`/api/games/${gameId}`)
                    if (gameResponse.status === 200) {
                        setGame(gameResponse.data)
                    }
                }
            } catch (err) {
                console.error('Pass failed', err)
                if (axios.isAxiosError(err) && err.response?.status === 400) {
                    setPassMessage('Warte auf den anderen Spieler')
                    // Fetch updated game state to sync with backend
                    try {
                        const gameResponse = await axios.get(
                            `/api/games/${gameId}`
                        )
                        if (gameResponse.status === 200) {
                            setGame(gameResponse.data)
                        }
                    } catch {
                        // ignore
                    }
                } else {
                    setPassMessage('Fehler beim Passen')
                }
                setTimeout(() => setPassMessage(null), 2000)
            } finally {
                isPassingRef.current = false
                setIsPassing(false)
            }
        }
    }, [gameId, game, localUser?.id])

    return (
        <>
            <Header>
                <HeaderLeft>
                    <h3>
                        <Link
                            href="https://www.learn-go.net/"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Visit learn-go{' '}
                            <FontAwesomeIcon
                                icon={faExternalLinkAlt}
                                size="xs"
                            />
                        </Link>
                    </h3>
                </HeaderLeft>
                <HeaderCenter>
                    <h1>Go</h1>
                </HeaderCenter>
                <HeaderRight>
                    {localUser && (
                        <Logout onClick={handleLogout} type="button">
                            Logout
                        </Logout>
                    )}
                </HeaderRight>
            </Header>
            <Content>
                {!localUser ? (
                    <Login />
                ) : game ? (
                    <>
                        <Goban size={9} />
                    </>
                ) : (
                    <GameList />
                )}
            </Content>
            {localUser && game && (
                <Nav>
                    <NavButton onClick={handleNewGame} type="button">
                        {game.gameState === GameState.ENDED
                            ? 'Zurück'
                            : 'Neues Spiel'}
                    </NavButton>
                    <NavButton
                        disabled={
                            game.gameState === GameState.ENDED ||
                            isPassing ||
                            !isMyTurn
                        }
                        onClick={handlePass}
                        title={!isMyTurn ? 'Warte auf den anderen Spieler' : ''}
                        type="button"
                    >
                        {passMessage ||
                            (isPassing
                                ? 'Warten...'
                                : isMyTurn
                                  ? 'Passen'
                                  : 'Warten...')}
                    </NavButton>
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
