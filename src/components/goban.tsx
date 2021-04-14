import React, { FC } from 'react'
import styled from 'styled-components'

interface Props {
    height: number
    width: number
}

const TileRow = styled.div`
    display: flex;
    flex-direction: row;
`

const Tile = styled.img`
    height: 50px;
    width: 50px;
`

const Goban: FC<Props> = props => {
    return (
        <>
            <TileRow>
                <Tile src="/Go_ul.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_u.svg" />
                <Tile src="/Go_ur.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_-.svg" />
                <Tile src="/Go_w.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_-.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_-.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_b.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_-.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_-.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_l.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_m.svg" />
                <Tile src="/Go_r.svg" />
            </TileRow>
            <TileRow>
                <Tile src="/Go_dl.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_d.svg" />
                <Tile src="/Go_dr.svg" />
            </TileRow>
        </>
    )
}

export default Goban
