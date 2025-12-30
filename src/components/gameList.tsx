import React, { FC, useCallback, useEffect, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { Game, User } from '../lib/types'
import axios from 'axios'
import styled, { css, keyframes } from 'styled-components'
import Spinner from './spinner'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCheckCircle,
    faHourglassHalf,
    faPlayCircle,
    faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { media } from '../lib/theme'

library.add(fab, faCheckCircle, faHourglassHalf, faPlayCircle, faTrash)

const GameListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.sm};
`

const GameListTitle = styled.h1`
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin: 0;

    ${media.md} {
        font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    }
`

const NewGame = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    width: 100%;

    ${media.sm} {
        flex-direction: row;
        align-items: center;
    }
`

const NewGameTitleField = styled.input`
    flex: 1;
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: 16px;
    border: 2px solid ${({ theme }) => theme.colors.textMuted};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${({ theme }) => theme.colors.white};
    min-height: ${({ theme }) => theme.touchTarget.comfortable};

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.secondary};
    }
`

const CreateGameButton = styled.button`
    background: linear-gradient(
        20deg,
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.secondary}
    );
    color: ${({ theme }) => theme.colors.white};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: 600;
    padding: ${({ theme }) => theme.spacing.md}
        ${({ theme }) => theme.spacing.lg};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    min-height: ${({ theme }) => theme.touchTarget.comfortable};
    white-space: nowrap;
    background-size: 150%;
    transition: transform 0.1s ease;

    &:active {
        transform: scale(0.98);
    }

    ${media.sm} {
        width: auto;
    }
`

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

const slideInFromBottom = keyframes`
    0% {
        opacity: 0;
        transform: translateY(30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`

const GameCard = styled.button<{ $isNew?: boolean }>`
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    width: 100%;
    max-width: 400px;
    min-height: ${({ theme }) => theme.touchTarget.comfortable};
    padding: ${({ theme }) => theme.spacing.lg};
    background: ${({ theme }) => theme.colors.background};
    border: none;
    text-align: center;
    color: inherit;
    font-family: inherit;

    &:after {
        content: '';
        position: absolute;
        background: linear-gradient(
            20deg,
            ${({ theme }) => theme.colors.primary},
            ${({ theme }) => theme.colors.secondary}
        );
        width: calc(100% + 6px);
        height: calc(100% + 6px);
        background-size: 150%;
        z-index: -1;
        top: -3px;
        left: -3px;
        border-radius: ${({ theme }) => theme.borderRadius.md};
        animation: ${onGameHoverOut} 300ms ease-in 1 forwards;
    }

    &:hover:after,
    &:focus:after {
        animation: ${onGameHover} 300ms ease-in 1 forwards;
    }

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.secondary};
        outline-offset: 4px;
    }

    &:active {
        transform: scale(0.98);
    }

    ${media.sm} {
        flex-direction: row;
        text-align: left;
        padding: ${({ theme }) => theme.spacing.md}
            ${({ theme }) => theme.spacing.xxl}
            ${({ theme }) => theme.spacing.md}
            ${({ theme }) => theme.spacing.md};
    }

    ${({ $isNew }) =>
        $isNew &&
        css`
            animation: ${slideInFromBottom} 400ms ease-out forwards;
        `}
`

const GameStatus = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
`

const GameDetails = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
`

const GameTitle = styled.h3`
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const GameDate = styled.span`
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`

const GameId = styled.span`
    position: absolute;
    top: ${({ theme }) => theme.spacing.sm};
    right: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`

const DeleteButton = styled.button`
    position: absolute;
    bottom: ${({ theme }) => theme.spacing.sm};
    right: ${({ theme }) => theme.spacing.sm};
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.sm};
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition:
        color 0.2s ease,
        background-color 0.2s ease;

    &:hover,
    &:focus {
        color: ${({ theme }) => theme.colors.error};
        background-color: rgba(255, 0, 0, 0.1);
    }

    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.error};
        outline-offset: 2px;
    }
`

const EmptyState = styled.p`
    color: ${({ theme }) => theme.colors.textMuted};
    text-align: center;
    padding: ${({ theme }) => theme.spacing.xl};
`

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.error};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin: 0;
    text-align: center;
`

type GameWithAnimation = Game & { isNew?: boolean }

interface GameListItemProps {
    game: GameWithAnimation
    onSelect: (game: Game) => void
    onDelete: (e: React.MouseEvent, gameId: number) => void
    onAnimationEnd: (gameId: number) => void
}

const GameListItem: FC<GameListItemProps> = React.memo(
    ({ game, onSelect, onDelete, onAnimationEnd }) => {
        const handleSelect = useCallback(() => onSelect(game), [game, onSelect])
        const handleDelete = useCallback(
            (e: React.MouseEvent) => onDelete(e, game.id),
            [game.id, onDelete]
        )
        const handleAnimationEnd = useCallback(
            () => onAnimationEnd(game.id),
            [game.id, onAnimationEnd]
        )

        return (
            <GameCard
                $isNew={game.isNew}
                onAnimationEnd={handleAnimationEnd}
                onClick={handleSelect}
                type="button"
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
                            icon="hourglass-half"
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
                            size="2x"
                        />
                    )}
                </GameStatus>
                <GameDetails>
                    <GameTitle>{game.title}</GameTitle>
                    <GameDate>
                        {new Date(game.updatedAt).toLocaleString('de-CH')}
                    </GameDate>
                </GameDetails>
                <DeleteButton
                    aria-label="Spiel löschen"
                    onClick={handleDelete}
                    type="button"
                >
                    <FontAwesomeIcon icon="trash" />
                </DeleteButton>
            </GameCard>
        )
    }
)

const GameList: FC = () => {
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [gameTitle, setGameTitle] = useState<string>('')
    const [games, setGames] = useState<GameWithAnimation[]>([])

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
    }, [localUser])

    // Listen for service worker messages about new games
    useEffect(() => {
        const handleServiceWorkerMessage = (event: globalThis.MessageEvent) => {
            if (event.data?.type === 'NEW_GAME_CREATED') {
                const newGame = event.data.data?.data?.game
                if (newGame) {
                    setGames(prev => {
                        // Avoid duplicates
                        if (prev.find(g => g.id === newGame.id)) return prev
                        return [...prev, { ...newGame, isNew: true }]
                    })
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
    }, [])

    const handleGameTitleInput = useCallback(
        // eslint-disable-next-line no-undef
        (event: React.ChangeEvent<HTMLInputElement>) =>
            setGameTitle(event.target.value),
        []
    )

    const handleGameSelect = useCallback(
        (game: Game) => {
            if (game && localUser) {
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

        [setLocalGame, localUser, gameTitle, games]
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

    const handleDeleteGame = useCallback(
        (e: React.MouseEvent, gameId: number) => {
            e.stopPropagation()
            if (!window.confirm('Spiel wirklich löschen?')) return

            setLoading(true)
            axios
                .delete(`/api/games/${gameId}`)
                .then(r => {
                    if (r.status === 200) {
                        setGames(games.filter(g => g.id !== gameId))
                        if (localGame?.id === gameId) {
                            setLocalGame(null)
                        }
                    }
                    setError(null)
                    setLoading(false)
                })
                .catch(e => {
                    // eslint-disable-next-line no-console
                    console.log(e)
                    setError('Fehler beim Löschen')
                    setLoading(false)
                })
        },
        [games, localGame, setLocalGame]
    )

    const handleAnimationEnd = useCallback((gameId: number) => {
        setGames(prev =>
            prev.map(g => (g.id === gameId ? { ...g, isNew: false } : g))
        )
    }, [])

    return (
        <GameListContainer>
            <GameListTitle>Games</GameListTitle>
            <NewGame>
                <NewGameTitleField
                    onChange={handleGameTitleInput}
                    placeholder="Spielname eingeben"
                />
                <CreateGameButton onClick={handleCreateGame}>
                    Neues Spiel
                </CreateGameButton>
            </NewGame>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {loading ? (
                <Spinner />
            ) : (
                games.map(game => (
                    <GameListItem
                        key={game.id}
                        game={game}
                        onAnimationEnd={handleAnimationEnd}
                        onDelete={handleDeleteGame}
                        onSelect={handleGameSelect}
                    />
                ))
            )}
            {!loading && games.length < 1 && (
                <EmptyState>Keine Spiele vorhanden</EmptyState>
            )}
        </GameListContainer>
    )
}

export default GameList
