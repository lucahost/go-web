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

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <Layout>
            <Head>
                <title>Go</title>
                <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                <link href="/favicon.ico" rel="alternate icon" />
            </Head>
            <GlobalStyle />
            <Component {...pageProps} />
        </Layout>
    )
}

export default App
