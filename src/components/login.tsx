import React, { FC, useCallback, useState } from 'react'
import useLocalStorage from '../lib/hooks/useLocalStorage'
import { User } from '../lib/types'
import axios from 'axios'

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
                .then(r => {
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
        <h1>Loading</h1>
    ) : (
        <>
            <h1>Bitte anmelden</h1>
            {error && <p>{error}</p>}
            <input onChange={handleNameInput} placeholder="Name eingeben" />
            <input onChange={handleEmailInput} placeholder="Email eingeben" />
            <button onClick={handleLogin}>Go</button>
        </>
    )
}

export default Login
