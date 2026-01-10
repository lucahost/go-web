/* global HTMLInputElement */
import React, { FC, FormEvent, useCallback, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { User } from '../lib/types'
import axios from 'axios'
import Spinner from './spinner'
import styled, { keyframes } from 'styled-components'
import { media } from '../lib/theme'

const LoginForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    width: 100%;
    max-width: 400px;
    padding: ${({ theme }) => theme.spacing.md};
`

const LoginTitle = styled.h1`
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
    text-align: center;

    ${media.md} {
        font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    }
`

const FieldInput = styled.input`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
    font-size: 16px;
    line-height: 1.5;
    border: 2px solid ${({ theme }) => theme.colors.textMuted};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.surface};
    min-height: ${({ theme }) => theme.touchTarget.comfortable};
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.secondary};
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }

    ${media.md} {
        max-width: 300px;
    }
`

const onLoginHover = keyframes`
    0% {
        background-position: 0% 0%
    }
    100% {
        background-position: 100% 0%
    }
`

const onLoginHoverOut = keyframes`
    0% {
        background-position: 100% 0%
    }
    100% {
        background-position: 0% 0%
    }
`

const LoginButton = styled.button`
    width: 100%;
    background: linear-gradient(
        20deg,
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.secondary}
    );
    color: ${({ theme }) => theme.colors.white};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: 600;
    padding: ${({ theme }) => theme.spacing.md};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    min-height: ${({ theme }) => theme.touchTarget.comfortable};
    background-size: 150%;
    animation: ${onLoginHoverOut} 600ms ease-in 1 forwards;
    transition: transform 0.1s ease;

    &:hover {
        animation: ${onLoginHover} 600ms ease-in 1 forwards;
    }

    &:active {
        transform: scale(0.98);
    }

    ${media.md} {
        max-width: 300px;
    }
`

const ErrorMessage = styled.p`
    color: ${({ theme }) => theme.colors.error};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin: 0;
    text-align: center;
`

const WelcomeMessage = styled.p`
    color: ${({ theme }) => theme.colors.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: 600;
    margin: 0;
    text-align: center;
`

const DifferentUserButton = styled.button`
    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    border: none;
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.sm};
    text-decoration: underline;
    transition: color 0.2s ease;

    &:hover {
        color: ${({ theme }) => theme.colors.secondary};
    }
`

const Login: FC = () => {
    const [, setLocalUser] = useLocalStorage<User | null>('user', null)
    const [savedUsername, setSavedUsername] = useLocalStorage<string | null>(
        'savedUsername',
        null
    )

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [name, setName] = useState<string>(savedUsername || '')
    const [showWelcomeBack, setShowWelcomeBack] =
        useState<boolean>(!!savedUsername)

    const handleNameInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            setName(event.target.value),
        []
    )

    const handleLogin = useCallback(() => {
        if (name !== '') {
            const url = `/api/users`
            setLoading(true)
            axios
                .post<User>(url, { name: name })
                .then(async r => {
                    if (r.status === 200 || r.status === 201) {
                        setLocalUser(r.data)
                    }
                    setError(null)
                    setLoading(false)
                })
                .catch(e => {
                    console.error('Login failed:', e)
                    setError('Fehler bei Anmeldung')
                    setLoading(false)
                })
        }
    }, [name, setLocalUser])

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault()
            handleLogin()
        },
        [handleLogin]
    )

    const handleDifferentUser = useCallback(() => {
        setSavedUsername(null)
        setName('')
        setShowWelcomeBack(false)
    }, [setSavedUsername])

    return loading ? (
        <Spinner />
    ) : (
        <LoginForm onSubmit={handleSubmit}>
            <LoginTitle>Bitte anmelden</LoginTitle>
            {showWelcomeBack && savedUsername && (
                <WelcomeMessage>
                    Willkommen zurück, {savedUsername}!
                </WelcomeMessage>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <FieldInput
                autoComplete="name"
                name="name"
                onChange={handleNameInput}
                placeholder="Name eingeben"
                type="text"
                value={name}
            />
            <LoginButton type="submit">Go</LoginButton>
            {showWelcomeBack && (
                <DifferentUserButton
                    onClick={handleDifferentUser}
                    type="button"
                >
                    Login als anderer Benutzer
                </DifferentUserButton>
            )}
        </LoginForm>
    )
}

export default Login
