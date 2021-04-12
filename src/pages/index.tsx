import Head from 'next/head'
import React, { FC } from 'react'
import { GlobalStyle } from '../lib/theme'
import styled from 'styled-components'

const Layout = styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;
`

const Header = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;

    background-color: #252525;

    font-size: 24px;
    text-transform: uppercase;
    font-weight: bold;

    width: 100%;
    height: 50px;
    padding: 0 20px;
`

const Content = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    width: 100%;
`

const Nav = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;

    height: 60px;
    width: 100%;
    padding: 5px 0;

    background-color: white;
`

const NavButton = styled.div`
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    height: 100%;
`

const Message = styled.div`
    height: 50px;
`

const TileRow = styled.div`
    display: flex;
    flex-direction: row;
`

const Tile = styled.img`
    height: 50px;
    width: 50px;
`

const HomePage: FC = () => {
    return (
        <Layout>
            <Head>
                <title>Go</title>
                <link href="/favicon.ico" rel="icon" />
            </Head>
            <GlobalStyle />
            <Header>Go</Header>
            <Content>
                <Message>Schwarz am Zug </Message>
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
            </Content>
            <Nav>
                <NavButton>Neues Spiel</NavButton>
                <NavButton>Passen</NavButton>
            </Nav>
        </Layout>
    )
}

/*
 * If you export an async function called getStaticProps from a page,
 * Next.js will pre-render this page at build time using the props
 * returned by getStaticProps.
 */
/*
export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}, // will be passed to the page component as props
    }
}
*/

/*
 * If a page has dynamic routes (documentation) and uses getStaticProps it
 * needs to define a list of paths that have to be rendered to HTML at build time.
 */
/*
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [], // determines which paths will be pre-rendered
    fallback: false, // any paths not returned by getStaticPaths will return 404
})
*/

/*
 * You should use getServerSideProps only if you need to pre-render
 * a page whose data must be fetched at request time.
 */
/*
export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {}, // will be passed to the page component as props
    }
}
*/

export default HomePage
