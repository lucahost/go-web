import { render } from '@testing-library/react'
import Dummy from '../../src/components/dummy'

describe('ButtonGroup', () => {
    it('renders correctly', () => {
        const { container } = render(<Dummy text="Hello World" />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
