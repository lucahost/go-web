import { createGlobalStyle } from 'styled-components'

// Breakpoints (mobile-first, min-width)
export const breakpoints = {
    xs: 390,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
} as const

// Media query helpers
export const media = {
    xs: `@media (min-width: ${breakpoints.xs}px)`,
    sm: `@media (min-width: ${breakpoints.sm}px)`,
    md: `@media (min-width: ${breakpoints.md}px)`,
    lg: `@media (min-width: ${breakpoints.lg}px)`,
    xl: `@media (min-width: ${breakpoints.xl}px)`,
} as const

// Theme object
export const theme = {
    colors: {
        primary: '#e66465',
        secondary: '#9198e5',
        background: '#414246',
        surface: '#252525',
        text: '#ffffff',
        textMuted: '#8b8683',
        error: '#ff4444',
        white: '#ffffff',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
    },
    typography: {
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.5rem',
            xxl: '2rem',
        },
    },
    touchTarget: {
        minimum: '44px',
        comfortable: '48px',
    },
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
    },
} as const

export type Theme = typeof theme

export const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
    }

    html {
        font-size: 16px;
    }

    html,
    body,
    #__next {
        height: 100%;
        width: 100%;
        overflow-x: hidden;
    }

    body {
        margin: 0;
        padding: 0;
        font-family: ${theme.typography.fontFamily};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: ${theme.colors.text};
        background-color: ${theme.colors.background};
        line-height: 1.5;
        overscroll-behavior-y: contain;
    }

    #root {
        display: flex;
        flex-direction: column;
    }

    /* Safe area insets for notched devices */
    @supports (padding: env(safe-area-inset-bottom)) {
        body {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
        }
    }
`
