import styled from 'styled-components'
import { Field, Vertex } from '../lib/types'
import { memo } from 'react'

interface Props {
    field: Field
    clickHandler: (vertex: Vertex) => void
}

const TileContainer = styled.img`
    height: 50px;
    width: 50px;
`

const Tile = memo(({ field, clickHandler }: Props) => {
    return (
        <TileContainer
            // TODO: should not use arrow functions
            onClick={() => clickHandler(field.vertex)}
            src={`/Go_${field.location}.svg`}
        />
    )
})

export default Tile
