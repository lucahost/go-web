import { render } from '@testing-library/react'
import Goban from '../../src/components/goban'

describe('ButtonGroup', () => {
    it('renders correctly', () => {
        const { container } = render(<Goban size={9} />)
        expect(container).toMatchSnapshot()
    })
})
