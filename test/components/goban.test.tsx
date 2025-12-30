import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import Goban from '../../src/components/goban'
import { theme } from '../../src/lib/theme'

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
        const { container } = render(
            <ThemeProvider theme={theme}>
                <Goban size={9} />
            </ThemeProvider>
        )
        expect(container).toMatchSnapshot()
    })
})
