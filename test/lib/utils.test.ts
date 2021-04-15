import { chunk } from '../../src/lib/utils'

describe('chunk an array', () => {
    it('should return a chunked array if length is lower than size', () => {
        expect(chunk([...Array(1).keys()], 2).length).toStrictEqual(1)
    })
    it('should return a chunked array if length is unequal', () => {
        expect(chunk([...Array(3).keys()], 2).length).toStrictEqual(2)
    })
    it('should return a chunked array if length is equal', () => {
        expect(chunk([...Array(10).keys()], 2).length).toStrictEqual(5)
    })
})
