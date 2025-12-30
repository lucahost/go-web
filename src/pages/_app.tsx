import { AppProps } from 'next/app'
import React, { FC } from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle, theme } from '../lib/theme'
import styled from 'styled-components'

const Layout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 100dvh;
`

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <ThemeProvider theme={theme}>
            <Layout>
                <Head>
                    <title>Go</title>
                    <meta
                        content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
                        name="viewport"
                    />
                    <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                    <link href="/favicon.ico" rel="alternate icon" />
                </Head>
                <GlobalStyle />
                <Component {...pageProps} />
            </Layout>
        </ThemeProvider>
    )
}

export default App
