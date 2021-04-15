import { FieldLocation, PlayerColor, Vertex } from '../../src/lib/types'
import { createField } from '../../src/lib/field'

describe('generate a field', () => {
    it('should generate a valid field', () => {
        const object = {
            vertex: [0, 0] as Vertex,
            location: FieldLocation.UP_LEFT,
            color: PlayerColor.EMPTY,
        }
        const field = createField(object.vertex, object.location, object.color)
        expect(field).toStrictEqual(object)
    })
})
