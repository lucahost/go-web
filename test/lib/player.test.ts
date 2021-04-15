import { PlayerColor } from '../../src/lib/types'
import { createPlayer } from '../../src/lib/player'

describe('generate a player', () => {
    it('should generate a valid player', () => {
        const object = {
            name: 'Foo Bar',
            color: PlayerColor.BLACK,
        }
        const player = createPlayer(object.name, object.color)
        expect(player.identifier).toStrictEqual('uuid')
        expect(player.name).toStrictEqual(object.name)
        expect(player.color).toStrictEqual(object.color)
    })
})
