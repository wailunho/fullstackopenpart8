import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'
import { useState, useEffect } from 'react'

const Login = ({ setToken, show, setPage }) => {
  const [login, result] = useMutation(LOGIN)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      setPage('add')
      localStorage.setItem('currentUser', token)
    }
  }, [result.data]) // eslint-disable-line

  const handleLogin = async (e) => {
    e.preventDefault()
    login({ variables: { username, password } })
  }

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }
  return (
    <div>
      <form onSubmit={handleLogin}>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
