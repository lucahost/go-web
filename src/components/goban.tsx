import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { generateBoardLayout, withNewFieldColor } from '../lib/board'
import { chunk } from '../lib/utils'
import Tile from './tile'
import { Field, Game, PlayerColor, Vertex } from '../lib/types'
import axios from 'axios'
import useLocalStorage from '../lib/hooks/useLocalStorage'

interface Props {
    size: number
}

const TileRow = styled.div`
    display: flex;
    flex-direction: row;
`
const Message = styled.div`
    height: 50px;
`

const Captures = styled.div`
    height: 50px;
`

const { error, log } = console

const Goban: FC<Props> = props => {
    const [fields, setFields] = useState<Field[]>(
        generateBoardLayout(props.size)
    )
    const [rows, setRows] = useState(chunk(fields, props.size))
    const [currentPlayer, setCurrentPlayer] = useState(PlayerColor.BLACK)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localGame, setLocalGame] = useLocalStorage<Game | null>('game', null)

    const handleTileClick = useCallback(
        (vertex: Vertex) => {
            {
                const newBoard = withNewFieldColor(
                    fields,
                    vertex,
                    currentPlayer
                )
                setFields(newBoard)
                setRows(chunk(newBoard, props.size))
                setCurrentPlayer(
                    currentPlayer === PlayerColor.BLACK
                        ? PlayerColor.WHITE
                        : PlayerColor.BLACK
                )
            }
        },
        [fields, currentPlayer, props.size]
    )

    const getBoard = useCallback(async () => {
        if (localGame) {
            const url = `/api/games/${localGame.id}`
            axios
                .get<Game>(url)
                .then(r => {
                    if (r.status === 200) {
                        setLocalGame(r.data)
                        setFields(r.data.board.fields)
                    }
                })
                .catch(e => {
                    error(e)
                })
        }
    }, [])

    useEffect(() => {
        navigator.serviceWorker.addEventListener('message', event => {
            getBoard()
            log(event.data.msg, event.data.url)
        })
    }, [])

    return (
        <>
            <Message>
                {currentPlayer === PlayerColor.BLACK ? 'Schwarz' : 'Weiss'} am
                Zug
            </Message>
            {rows.map((rows, i) => (
                <TileRow key={i}>
                    {rows.map((field, j) => (
                        <Tile
                            key={j}
                            // eslint-disable-next-line react/jsx-no-bind
                            clickHandler={() => handleTileClick(field.vertex)}
                            currentPlayer={currentPlayer}
                            field={field}
                        />
                    ))}
                </TileRow>
            ))}
            <Captures>
                <p>White: 0</p>
                <p>Black: 1</p>
            </Captures>
        </>
    )
}

export default Goban
