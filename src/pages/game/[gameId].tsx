import React, { FC, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import useLocalStorage from '../../lib/hooks/useLocalStorage'
import { Game, GameState, User } from '../../lib/types'
import axios from 'axios'
import Login from '../../components/login'
import Goban from '../../components/goban'
import Spinner from '../../components/spinner'
import { media } from '../../lib/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

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

const LoginMessage = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing.md};
`

const ErrorMessage = styled.div`
    color: ${({ theme }) => theme.colors.error};
    text-align: center;
    padding: ${({ theme }) => theme.spacing.xl};
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

const GamePage: FC = () => {
    const router = useRouter()
    const { gameId } = router.query

    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [storedGameId, setStoredGameId] = useLocalStorage<number | null>(
        'gameId',
        null
    )

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [passMessage, setPassMessage] = useState<string | null>(null)
    const [gameExists, setGameExists] = useState(false)
    const [localGame, setLocalGame] = useState<Game | null>(null)
    const [, setIsSubscribed] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [registration, setRegistration] =
        useState<ServiceWorkerRegistration | null>(null)
    const [isPassing, setIsPassing] = useState(false)
    const isPassingRef = React.useRef(false)

    // Register service worker
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('Service worker registration failed:', err)
            })

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
    }, [localUser, setLocalUser])

    // Subscribe to push after login
    useEffect(() => {
        const onLogin = async () => {
            if (!localUser) return

            const sub = await registration?.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(
                    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? ''
                ),
            })

            setSubscription(sub ?? null)
            setIsSubscribed(true)
            setLocalUser({ ...localUser, subscription: JSON.stringify(sub) })

            // Register global subscription
            if (sub) {
                axios
                    .post('/api/subscriptions', {
                        userId: localUser.id,
                        subscription: JSON.stringify(sub),
                        isGlobal: true,
                    })
                    .catch(() => {})
            }
        }

        if (localUser && localUser?.subscription === undefined) {
            onLogin()
        }
    }, [localUser, setLocalUser, registration?.pushManager])

    // Check if game exists
    useEffect(() => {
        if (!gameId || typeof gameId !== 'string') return

        const checkGame = async () => {
            try {
                const response = await axios.get(`/api/games/${gameId}`)
                if (response.status === 200) {
                    setGameExists(true)
                }
            } catch {
                setError('Spiel nicht gefunden')
            } finally {
                setLoading(false)
            }
        }
        checkGame()
    }, [gameId])

    // Fetch game data
    useEffect(() => {
        if (!gameId || typeof gameId !== 'string' || !gameExists) return

        const fetchGame = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`/api/games/${gameId}`)
                if (response.status === 200) {
                    setLocalGame(response.data)
                }
            } catch {
                setError('Fehler beim Laden des Spiels')
            } finally {
                setLoading(false)
            }
        }

        fetchGame()
    }, [gameId, gameExists])

    // Auto-join after login
    useEffect(() => {
        if (!localUser || !gameId || typeof gameId !== 'string' || !gameExists)
            return

        // Already in this game
        if (storedGameId && storedGameId === Number(gameId)) {
            return
        }

        const joinGame = async () => {
            setLoading(true)
            try {
                const response = await axios.post(`/api/games/${gameId}/join`, {
                    userId: localUser.id,
                    subscription: localUser.subscription,
                })
                if (response.status === 200) {
                    setStoredGameId(response.data.id)
                    setLocalGame(response.data)
                }
            } catch {
                setError('Fehler beim Beitreten')
            } finally {
                setLoading(false)
            }
        }

        joinGame()
    }, [localUser, gameId, gameExists, storedGameId, setStoredGameId])

    const handleLogout = useCallback(async () => {
        await subscription?.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)
        setLocalUser(null)
        setStoredGameId(null)
        setLocalGame(null)
        router.push('/')
    }, [subscription, setLocalUser, setStoredGameId, router])

    const handleNewGame = useCallback(() => {
        setStoredGameId(null)
        setLocalGame(null)
        router.push('/')
    }, [setStoredGameId, router])

    const handlePass = useCallback(async () => {
        if (!localGame || isPassingRef.current) return

        // Prevent pass if it's not the user's turn
        if (localGame.currentPlayer?.userId !== localUser?.id) {
            setPassMessage('Warte auf den anderen Spieler')
            setTimeout(() => setPassMessage(null), 2000)
            return
        }

        isPassingRef.current = true
        setIsPassing(true)
        try {
            const response = await axios.post(
                `/api/games/${localGame.id}/pass`,
                {
                    userId: localUser?.id,
                }
            )

            if (response.status === 200) {
                // Fetch updated game state after successful pass
                const gameResponse = await axios.get(
                    `/api/games/${localGame.id}`
                )
                if (gameResponse.status === 200) {
                    setLocalGame(gameResponse.data)
                }
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                setPassMessage('Warte auf den anderen Spieler')
            } else {
                setPassMessage('Fehler beim Passen')
            }
            setTimeout(() => setPassMessage(null), 2000)
        } finally {
            isPassingRef.current = false
            setIsPassing(false)
        }
    }, [localGame, localUser?.id])

    const isMyTurn = localGame?.currentPlayer?.userId === localUser?.id

    // Show login if not logged in
    if (!localUser) {
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
                    <HeaderRight />
                </Header>
                <Content>
                    <Login />
                    <LoginMessage>
                        Bitte anmelden um dem Spiel beizutreten
                    </LoginMessage>
                </Content>
            </>
        )
    }

    // Show loading
    if (loading) {
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
                        <Logout onClick={handleLogout} type="button">
                            Logout
                        </Logout>
                    </HeaderRight>
                </Header>
                <Content>
                    <Spinner />
                </Content>
            </>
        )
    }

    // Show error
    if (error) {
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
                        <Logout onClick={handleLogout} type="button">
                            Logout
                        </Logout>
                    </HeaderRight>
                </Header>
                <Content>
                    <ErrorMessage>{error}</ErrorMessage>
                    <NavButton onClick={handleNewGame}>
                        Zur Spieleliste
                    </NavButton>
                </Content>
            </>
        )
    }

    // Show game board
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
                    <Logout onClick={handleLogout} type="button">
                        Logout
                    </Logout>
                </HeaderRight>
            </Header>
            <Content>
                <Goban size={9} />
            </Content>
            {localGame && (
                <Nav>
                    <NavButton onClick={handleNewGame} type="button">
                        {localGame.gameState === GameState.ENDED
                            ? 'Zurück'
                            : 'Neues Spiel'}
                    </NavButton>
                    <NavButton
                        disabled={
                            localGame.gameState === GameState.ENDED ||
                            !isMyTurn ||
                            isPassing
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

export default GamePage
