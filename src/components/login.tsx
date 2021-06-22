import React, { FC, useCallback, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { User } from '../lib/types'
import axios from 'axios'
import Spinner from './spinner'
import styled, { keyframes } from 'styled-components'

const FieldInput = styled.input`
    width: 25%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
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
    width: 25%;
    background: linear-gradient(20deg, #e66465, #9198e5);
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-size: 150%;
    animation: ${onLoginHoverOut} 600ms ease-in 1 forwards;
    :hover {
        animation: ${onLoginHover} 600ms ease-in 1 forwards;
    }
`

const Login: FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [localUser, setLocalUser] = useLocalStorage<User | null>('user', null)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState<string>('')
    const [name, setName] = useState<string>('')

    const handleEmailInput = useCallback(
        event => setEmail(event.target.value),
        []
    )

    const handleNameInput = useCallback(
        event => setName(event.target.value),
        []
    )

    const handleLogin = useCallback(() => {
        if (email !== '') {
            const url = `/api/users`
            setLoading(true)
            axios
                .post<User>(url, { name: name, email: email })
                .then(async r => {
                    if (r.status === 200 || r.status === 201) {
                        setLocalUser(r.data)
                    }
                    setError(null)
                    setLoading(false)
                })
                .catch(e => {
                    console.log(e)
                    setError('Fehler bei Anmeldung')
                    setLoading(false)
                })
        }
    }, [email, name, setLocalUser])

    return loading ? (
        <Spinner />
    ) : (
        <>
            <h1>Bitte anmelden</h1>
            {error && <p>{error}</p>}
            <FieldInput
                name="name"
                onChange={handleNameInput}
                placeholder="Name eingeben"
            />
            <FieldInput
                name="email"
                onChange={handleEmailInput}
                placeholder="Email eingeben"
            />
            <LoginButton onClick={handleLogin}>Go</LoginButton>
        </>
    )
}

export default Login
