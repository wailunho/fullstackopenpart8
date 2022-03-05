import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    const t = localStorage.getItem('currentUser')
    if (t) {
      setToken(t)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setToken(null)
    setPage('authors')
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button
          style={{ display: token ? 'none' : '' }}
          onClick={() => setPage('login')}
        >
          login
        </button>
        <button
          style={{ display: token ? '' : 'none' }}
          onClick={() => setPage('add')}
        >
          add book
        </button>
        <button style={{ display: token ? '' : 'none' }} onClick={handleLogout}>
          logout
        </button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />
      <Login setToken={setToken} setPage={setPage} show={page === 'login'} />
    </div>
  )
}

export default App
