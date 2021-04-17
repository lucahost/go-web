import { render } from '@testing-library/react'
import Tile from '../../src/components/tile'
import { FieldLocation, PlayerColor, Vertex } from '../../src/lib/types'

describe('Tile', () => {
    it('renders correctly', () => {
        const clickHandler = () => {
            return
        }
        const field = {
            vertex: [0, 0] as Vertex,
            location: FieldLocation.UP_RIGHT,
            color: PlayerColor.EMPTY,
        }
        const { container } = render(
            <Tile
                clickHandler={clickHandler}
                currentPlayer={PlayerColor.BLACK}
                field={field}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
