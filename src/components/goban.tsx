import React, {
    FC,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import styled, { keyframes } from 'styled-components'
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
    Vertex,
} from '../lib/types'
import { isKo, isOccupied, isSuicide } from '../lib/rules'
import axios from 'axios'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { getFieldLocationByVertex } from '../lib/board-queries'
import useSoundEffect from '../lib/hooks/useSoundEffect'
import { media } from '../lib/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShare, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import {
    calculateDominance,
    calculateInfluence,
    Dominance,
    Influence,
} from '../lib/scoring'

interface Props {
    size: number
}

// Helper to create a unique key for a vertex
const vertexKey = (v: Vertex) => `${v[0]},${v[1]}`

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

const pulse = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.9; }
    100% { transform: scale(1); opacity: 1; }
`

const Message = styled.div<{ $isUserTurn?: boolean; $isGameOver?: boolean }>`
    min-height: 50px;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    text-align: center;
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
    transition: all 0.3s ease;
    background: ${({ theme, $isUserTurn, $isGameOver }) =>
        $isGameOver
            ? theme.colors.error
            : $isUserTurn
              ? theme.colors.primary
              : 'rgba(255, 255, 255, 0.1)'};
    color: ${({ theme, $isUserTurn, $isGameOver }) =>
        $isUserTurn || $isGameOver ? theme.colors.white : theme.colors.text};
    font-weight: ${({ $isUserTurn, $isGameOver }) =>
        $isUserTurn || $isGameOver ? 'bold' : 'normal'};
    box-shadow: ${({ theme, $isUserTurn }) =>
        $isUserTurn ? `0 0 15px ${theme.colors.primary}66` : 'none'};
    animation: ${({ $isUserTurn }) => ($isUserTurn ? pulse : 'none')} 2s
        infinite ease-in-out;

    ${media.md} {
        font-size: ${({ theme }) => theme.typography.fontSize.lg};
        min-height: 60px;
        padding: ${({ theme }) => theme.spacing.md}
            ${({ theme }) => theme.spacing.xl};
    }
`

const TurnStone = styled.div<{ $color: PlayerColor }>`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ $color }) =>
        $color === PlayerColor.BLACK ? '#000' : '#fff'};
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    ${media.md} {
        width: 20px;
        height: 20px;
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
    flex-wrap: wrap;
    width: 100%;
    max-width: 500px;
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.sm};

    p {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        white-space: nowrap;
    }
`

const DominanceInfo = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    max-width: 500px;
    padding: ${({ theme }) => theme.spacing.xs}
        ${({ theme }) => theme.spacing.md};
    padding-bottom: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.sm};
    position: relative;

    p {
        margin: 0;
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textMuted};
        white-space: nowrap;
    }
`

const ShareContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ShareButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondary};
    padding: ${({ theme }) => theme.spacing.sm}
        ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    font-family: inherit;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    min-height: ${({ theme }) => theme.touchTarget.minimum};
    transition: all 0.2s ease;

    &:hover,
    &:active {
        background: ${({ theme }) => theme.colors.secondary};
        color: ${({ theme }) => theme.colors.white};
    }
`

const ShareFeedback = styled.span`
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.secondary};
`

const TooltipContainer = styled.div`
    position: static;
    display: inline-flex;
    align-items: center;
    margin-left: ${({ theme }) => theme.spacing.xs};
`

const TooltipContent = styled.div`
    visibility: hidden;
    opacity: 0;
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
    max-width: 90vw;
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.textMuted};
    z-index: 100;
    transition:
        opacity 0.2s,
        visibility 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    pointer-events: none;

    /* Arrow */
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: ${({ theme }) => theme.colors.surface} transparent
            transparent transparent;
    }

    h5 {
        margin: 0 0 ${({ theme }) => theme.spacing.xs};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        color: ${({ theme }) => theme.colors.primary};
    }

    p {
        margin: 0 0 ${({ theme }) => theme.spacing.sm};
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.text};
        white-space: normal;
        line-height: 1.4;
    }

    p:last-child {
        margin-bottom: 0;
    }

    .calc {
        color: ${({ theme }) => theme.colors.textMuted};
        font-style: italic;
        display: block;
        margin-top: 2px;
    }
`

const InfoIconWrapper = styled.div`
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.xs};
    display: flex;
    outline: none;

    &:hover
        + ${TooltipContent},
        &:focus
        + ${TooltipContent},
        &:active
        + ${TooltipContent} {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
    }
`

const Goban: FC<Props> = props => {
    const [gameId] = useLocalStorage<number | null>('gameId', null)
    const [localUser] = useLocalStorage<User | null>('user', null)
    const [clickSound] = useSoundEffect('click.mp3')

    const [game, setGame] = useState<Game | null>(null)
    const [currentPlayer, setCurrentPlayer] = useState<Player>()
    const [board, setBoard] = useState<GoBoard>()
    const [whiteCaptures, setWhiteCaptures] = useState<number>(0)
    const [blackCaptures, setBlackCaptures] = useState<number>(0)
    const [dominance, setDominance] = useState<Dominance | null>(null)
    const [influence, setInfluence] = useState<Influence | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [shareStatus, setShareStatus] = useState<string | null>(null)

    // Animation and marker state
    const [lastPlacedVertex, setLastPlacedVertex] = useState<string | null>(
        null
    )
    const [lastMove, setLastMove] = useState<string | null>(null)
    const [capturingFields, setCapturingFields] = useState<Map<string, Field>>(
        new Map()
    )
    const previousBoardRef = useRef<GoBoard | null>(null)

    // Ref to store latest loadGame function for service worker messages
    const loadGameRef = useRef<() => void>(() => {})

    const addErrorMessage = (message: string) => {
        setError(message)
        const timer = setTimeout(() => setError(null), 1000)
        return () => clearTimeout(timer)
    }

    const userPlayer = useMemo(() => {
        if (game && localUser) {
            return game.players?.find(u => u.userId === localUser.id)
        }
        return undefined
    }, [game, localUser])

    const loadGame = useCallback(async () => {
        if (gameId) {
            const url = `/api/games/${gameId}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status === 200) {
                        setGame(r.data)

                        // Parse board if it's a string (backwards compatibility)
                        const boardData =
                            typeof r.data.board === 'string'
                                ? JSON.parse(r.data.board)
                                : r.data.board
                        const parsedBoard = boardData as GoBoard

                        // Detect newly placed stone for animation
                        const prevBoard = previousBoardRef.current
                        if (prevBoard && parsedBoard) {
                            const prevHistoryLen =
                                prevBoard.history?.length || 0
                            const newHistoryLen =
                                parsedBoard.history?.length || 0

                            // A new move was made
                            if (newHistoryLen > prevHistoryLen) {
                                const lastMoveData =
                                    parsedBoard.history[newHistoryLen - 1]
                                if (lastMoveData) {
                                    const key = vertexKey(lastMoveData.vertex)
                                    setLastPlacedVertex(key)
                                    setLastMove(key)
                                    // Clear animation after it completes
                                    setTimeout(
                                        () => setLastPlacedVertex(null),
                                        300
                                    )
                                }
                            } else if (newHistoryLen > 0) {
                                // Initialize lastMove if it's not set but history exists
                                const lastMoveData =
                                    parsedBoard.history[newHistoryLen - 1]
                                if (lastMoveData) {
                                    setLastMove(vertexKey(lastMoveData.vertex))
                                }
                            }

                            // Detect newly captured stones for animation
                            // Find stones that were on the board but are now empty
                            const newCaptured = new Map<string, Field>()
                            for (const prevField of prevBoard.fields) {
                                if (prevField.color !== PlayerColor.EMPTY) {
                                    const newField = parsedBoard.fields.find(
                                        f =>
                                            f.vertex[0] ===
                                                prevField.vertex[0] &&
                                            f.vertex[1] === prevField.vertex[1]
                                    )
                                    if (
                                        newField &&
                                        newField.color === PlayerColor.EMPTY
                                    ) {
                                        newCaptured.set(
                                            vertexKey(prevField.vertex),
                                            prevField
                                        )
                                    }
                                }
                            }

                            if (newCaptured.size > 0) {
                                setCapturingFields(newCaptured)
                                // Clear after animation completes
                                setTimeout(
                                    () => setCapturingFields(new Map()),
                                    350
                                )
                            }
                        }

                        // Store current board for next comparison
                        previousBoardRef.current = parsedBoard

                        setBoard(parsedBoard)

                        if (parsedBoard) {
                            const dom = calculateDominance(parsedBoard)
                            setDominance(dom)
                            const inf = calculateInfluence(parsedBoard)
                            setInfluence(inf)
                        }

                        if (parsedBoard && r.data.currentPlayer) {
                            const currentPlayer = r.data.currentPlayer as Player
                            setCurrentPlayer(currentPlayer)
                            setWhiteCaptures(
                                parsedBoard.captures.filter(
                                    field => field.color === PlayerColor.BLACK
                                ).length
                            )
                            setBlackCaptures(
                                parsedBoard.captures.filter(
                                    field => field.color === PlayerColor.WHITE
                                ).length
                            )
                        }
                    }
                })
                .catch(e => {
                    console.error('Failed to load game:', e)
                })
        }
    }, [gameId])

    // Keep ref updated with latest loadGame function
    useEffect(() => {
        loadGameRef.current = loadGame
    }, [loadGame])

    const handleTileClick = useCallback(
        (field: Field) => {
            {
                if (game?.gameState === GameState.ENDED) {
                    addErrorMessage('Game finished')
                    return
                }
                if (!currentPlayer || !userPlayer) {
                    addErrorMessage('Waiting for opponent')
                    return
                }
                if (currentPlayer.playerColor !== userPlayer.playerColor) {
                    addErrorMessage('Not your turn')
                    return
                }
                if (!board || isOccupied(board, field.vertex)) {
                    addErrorMessage('Field is occupied')
                    return
                }
                if (isSuicide(board, field.vertex, currentPlayer.playerColor)) {
                    addErrorMessage('Suicide')
                    return
                }
                if (
                    isKo(board, {
                        vertex: field.vertex,
                        color: currentPlayer.playerColor,
                    })
                ) {
                    addErrorMessage('Infinity / Ko')
                    return
                }
                clickSound()
                if (gameId) {
                    const url = `/api/games/${gameId}/moves`
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
        [
            currentPlayer,
            userPlayer,
            board,
            game?.gameState,
            gameId,
            localUser?.id,
            clickSound,
            loadGame,
        ]
    )

    useEffect(() => {
        // Handler that uses ref to always call the latest loadGame
        const handleServiceWorkerMessage = () => {
            loadGameRef.current()
        }

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener(
                'message',
                handleServiceWorkerMessage,
                true
            )
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener(
                    'message',
                    handleServiceWorkerMessage,
                    true
                )
            }
        }
    }, [])

    // Load game data when gameId changes (handles async localStorage initialization)
    useEffect(() => {
        if (gameId) {
            loadGame()
        }
    }, [gameId, loadGame])

    const shareUrl = useMemo(() => {
        if (typeof window === 'undefined' || !gameId) return ''
        return `${window.location.origin}/game/${gameId}`
    }, [gameId])

    const copyToClipboard = useCallback((url: string) => {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setShareStatus('Link kopiert!')
                setTimeout(() => setShareStatus(null), 2000)
            })
            .catch(() => {
                setShareStatus('Fehler beim Kopieren')
                setTimeout(() => setShareStatus(null), 2000)
            })
    }, [])

    const handleShare = useCallback(async () => {
        if (!shareUrl) return

        const shareData = {
            title: 'Go Spiel Einladung',
            text: `Tritt meinem Go Spiel bei: ${game?.title}`,
            url: shareUrl,
        }

        // Try Web Share API first (mobile/supported browsers)
        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData)
                setShareStatus('Geteilt!')
                setTimeout(() => setShareStatus(null), 2000)
            } catch (err) {
                // User cancelled or error - fallback to clipboard
                if ((err as Error).name !== 'AbortError') {
                    copyToClipboard(shareUrl)
                }
            }
        } else {
            // Fallback: copy to clipboard
            copyToClipboard(shareUrl)
        }
    }, [shareUrl, game?.title, copyToClipboard])

    return (
        <GobanContainer>
            <GameTitle>{game?.title}</GameTitle>
            {game?.gameState === GameState.INITIALIZED && (
                <ShareContainer>
                    <ShareButton onClick={handleShare} type="button">
                        <FontAwesomeIcon icon={faShare} />
                        Spiel teilen
                    </ShareButton>
                    {shareStatus && (
                        <ShareFeedback>{shareStatus}</ShareFeedback>
                    )}
                </ShareContainer>
            )}
            {userPlayer &&
                currentPlayer &&
                userPlayer.playerColor === currentPlayer.playerColor &&
                (game?.board as GoBoard)?.pass && (
                    <PassNotice>Der andere Spieler hat gepasst</PassNotice>
                )}

            {game?.gameState === GameState.RUNNING &&
                currentPlayer &&
                userPlayer && (
                    <Message
                        $isUserTurn={
                            userPlayer.playerColor === currentPlayer.playerColor
                        }
                    >
                        <TurnStone $color={currentPlayer.playerColor} />
                        <span>
                            {userPlayer.playerColor ===
                            currentPlayer.playerColor
                                ? `Du bist am Zug`
                                : `Gegner am Zug`}
                            {` (${
                                currentPlayer.playerColor === PlayerColor.BLACK
                                    ? 'Schwarz'
                                    : 'Weiss'
                            })`}
                        </span>
                    </Message>
                )}

            {game?.gameState === GameState.ENDED && (
                <Message $isGameOver>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>
                        GAME OVER
                        {dominance && (
                            <>
                                {' - '}
                                {dominance.whitePercentage >
                                dominance.blackPercentage
                                    ? 'Weiss gewinnt!'
                                    : dominance.blackPercentage >
                                        dominance.whitePercentage
                                      ? 'Schwarz gewinnt!'
                                      : 'Unentschieden!'}
                            </>
                        )}
                    </span>
                </Message>
            )}

            <BoardWrapper>
                <Board $size={props.size}>
                    {error && (
                        <Error>
                            <h4>{error}</h4>
                        </Error>
                    )}
                    {board?.fields?.map((field, i) => {
                        const key = vertexKey(field.vertex)
                        const isNewlyPlaced = lastPlacedVertex === key
                        const capturingField = capturingFields.get(key)
                        const isBeingCaptured = !!capturingField

                        // Use the capturing field's color for animation
                        const displayField = isBeingCaptured
                            ? capturingField
                            : field
                        const displayColor = displayField.color

                        const handleClick = () => handleTileClick(field)

                        return (
                            <Tile
                                key={i}
                                // eslint-disable-next-line react/jsx-no-bind
                                clickHandler={handleClick}
                                currentPlayer={currentPlayer?.playerColor}
                                field={displayField}
                                isBeingCaptured={isBeingCaptured}
                                isLastMove={lastMove === key}
                                isNewlyPlaced={isNewlyPlaced}
                                location={
                                    displayColor === PlayerColor.EMPTY
                                        ? getFieldLocationByVertex(
                                              field.vertex,
                                              props.size
                                          )
                                        : displayColor === PlayerColor.BLACK
                                          ? FieldLocation.BLACK_STONE
                                          : FieldLocation.WHITE_STONE
                                }
                                userPlayer={userPlayer?.playerColor}
                            />
                        )
                    })}
                </Board>
            </BoardWrapper>
            <Captures>
                <p>{`Weiss (Gefangen): ${whiteCaptures}`}</p>
                <p>{`Schwarz (Gefangen): ${blackCaptures}`}</p>
            </Captures>
            {dominance && (
                <DominanceInfo>
                    <p>{`Dominanz W: ${dominance.whitePercentage}%`}</p>
                    <p>{`Dominanz S: ${dominance.blackPercentage}%`}</p>
                    {influence && (
                        <>
                            <p>{`Potenzial W: ${influence.whitePercentage}%`}</p>
                            <p>{`Potenzial S: ${influence.blackPercentage}%`}</p>
                        </>
                    )}
                    <TooltipContainer>
                        <InfoIconWrapper
                            aria-label="Info zu Dominanz und Potenzial"
                            role="button"
                            tabIndex={0}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </InfoIconWrapper>
                        <TooltipContent>
                            <h5>Dominanz</h5>
                            <p>
                                Aktueller Punktestand basierend auf Steinen und
                                sicherem Gebiet.
                                <span className="calc">
                                    Berechnung: Steine + umschlossenes Gebiet.
                                </span>
                            </p>

                            <h5>Potenzial (Einfluss)</h5>
                            <p>
                                Zeigt, wer das Brett strategisch kontrolliert
                                und welche Bereiche wahrscheinlich wem gehören
                                werden.
                                <span className="calc">
                                    Berechnung: Wie stark die Steine auf freie
                                    Felder ausstrahlen.
                                </span>
                            </p>
                        </TooltipContent>
                    </TooltipContainer>
                </DominanceInfo>
            )}
        </GobanContainer>
    )
}

export default Goban
