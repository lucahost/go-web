import Document, {
    DocumentContext,
    Head,
    Html,
    Main,
    NextScript,
} from 'next/document'

const APP_NAME = 'fwebt-go'
const APP_DESCRIPTION = 'play go using our nextjs app'

export default class DocumentClass extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        return await Document.getInitialProps(ctx)
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
                    {/* TIP: set viewport head meta tag in _app.js, otherwise it will show a warning */}
                    {/* <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover' /> */}

                    <link
                        href="/icons/apple-touch-icon.png"
                        rel="apple-touch-icon"
                        sizes="180x180"
                    />
                    <link href="/manifest.json" rel="manifest" />
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
