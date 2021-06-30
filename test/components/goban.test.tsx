import { render } from '@testing-library/react'
import Goban from '../../src/components/goban'

beforeAll(() => {
    window.HTMLMediaElement.prototype.load = () => {
        /* do nothing */
    }
    window.HTMLMediaElement.prototype.play = () => {
        /* do nothing */
        return Promise.resolve()
    }
    window.HTMLMediaElement.prototype.pause = () => {
        /* do nothing */
    }
})

describe('ButtonGroup', () => {
    it('renders correctly', () => {
        const { container } = render(<Goban size={9} />)
        expect(container).toMatchSnapshot()
    })
})
