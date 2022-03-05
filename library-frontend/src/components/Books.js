import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const [filter, setFilter] = useState(null)
  const result = useQuery(ALL_BOOKS, {
    variables: { genre: filter },
    fetchPolicy: filter ? 'no-cache' : 'cache-first'
  })

  const genresResult = useQuery(ALL_BOOKS, {
    variables: { genre: null }
  })

  if (!props.show) {
    return null
  }

  if (result.loading || genresResult.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  const genres = [
    ...new Set([].concat(...genresResult.data.allBooks.map((x) => x.genres)))
  ]

  const handleFilterChange = (filter) => {
    return (e) => {
      e.preventDefault()
      setFilter(filter)
    }
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((x) => (
        <button key={x} onClick={handleFilterChange(x)}>
          {x}
        </button>
      ))}
      <button onClick={handleFilterChange(null)}>all genres</button>
    </div>
  )
}

export default Books
