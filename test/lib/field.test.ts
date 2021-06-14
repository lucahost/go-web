import { PlayerColor, Vertex } from '../../src/lib/types'
import { createField } from '../../src/lib/field'

describe('generate a field', () => {
    it('should generate a valid field', () => {
        const object = {
            vertex: [0, 0] as Vertex,
            color: PlayerColor.EMPTY,
        }
        const field = createField(object.vertex, object.color)
        expect(field).toStrictEqual(object)
    })
})
