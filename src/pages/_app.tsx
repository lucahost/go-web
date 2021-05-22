import { AppProps } from 'next/app'
import React, { FC } from 'react'
import Head from 'next/head'
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

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <Layout>
            <Head>
                <title>Go</title>
                <link href="/favicon.ico" rel="icon" />
            </Head>
            <GlobalStyle />
            <Header>Go</Header>
            <Component {...pageProps} />
        </Layout>
    )
}

export default App
