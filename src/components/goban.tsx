import React, { FC, useCallback, useState } from 'react'
import styled from 'styled-components'
import { generateBoardLayout, withNewFieldColor } from '../lib/board'
import { chunk } from '../lib/utils'
import Tile from './tile'
import { PlayerColor, Vertex } from '../lib/types'

interface Props {
    size: number
}

const TileRow = styled.div`
    display: flex;
    flex-direction: row;
`

const Goban: FC<Props> = props => {
    const [board, setBoard] = useState(generateBoardLayout(props.size))
    const [rows, setRows] = useState(chunk(board, props.size))
    const [currentPlayer, setCurrentPlayer] = useState(PlayerColor.BLACK)

    const handleTileClick = useCallback(
        (vertex: Vertex) => {
            {
                const newBoard = withNewFieldColor(board, vertex, currentPlayer)
                setBoard(newBoard)
                setRows(chunk(newBoard, props.size))
                setCurrentPlayer(
                    currentPlayer === PlayerColor.BLACK
                        ? PlayerColor.WHITE
                        : PlayerColor.BLACK
                )
            }
        },
        [board, currentPlayer, props.size]
    )

    return (
        <>
            {rows.map((rows, i) => (
                <TileRow key={i}>
                    {rows.map((field, j) => (
                        <Tile
                            key={j}
                            // TODO: should not use arrow functions
                            clickHandler={() => handleTileClick(field.vertex)}
                            field={field}
                        />
                    ))}
                </TileRow>
            ))}
        </>
    )
}

export default Goban
