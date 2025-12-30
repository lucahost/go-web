import Document, {
    DocumentContext,
    Head,
    Html,
    Main,
    NextScript,
} from 'next/document'
import { ServerStyleSheet } from 'styled-components'

const APP_NAME = 'fwebt-go'
const APP_DESCRIPTION = 'play go using our nextjs app'

export default class DocumentClass extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: App => props =>
                        sheet.collectStyles(<App {...props} />),
                })

            const initialProps = await Document.getInitialProps(ctx)
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            }
        } finally {
            sheet.seal()
        }
    }

    render() {
        return (
            <Html dir="ltr" lang="en">
                <Head>
                    <meta content={APP_NAME} name="application-name" />
                    <meta content="yes" name="apple-mobile-web-app-capable" />
                    <meta
                        content="default"
                        name="apple-mobile-web-app-status-bar-style"
                    />
                    <meta
                        content={APP_NAME}
                        name="apple-mobile-web-app-title"
                    />
                    <meta content={APP_DESCRIPTION} name="description" />
                    <meta content="telephone=no" name="format-detection" />
                    <meta content="yes" name="mobile-web-app-capable" />
                    <meta content="#FFFFFF" name="theme-color" />

                    <link
                        href="/icons/apple-touch-icon.png"
                        rel="apple-touch-icon"
                        sizes="180x180"
                    />
                    <link href="/manifest.json" rel="manifest" />
                    <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
                    <link href="/favicon.ico" rel="shortcut icon" />
                    <style>{`
            html, body, #__next {
              height: 100%;
            }
            #__next {
              margin: 0 auto;
            }
            h1 {
              text-align: center;
            }
            `}</style>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
