import { ME, ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client'

const Recommend = ({ show }) => {
  const bookResult = useQuery(ALL_BOOKS)
  const meResult = useQuery(ME)

  if (!show) {
    return null
  }

  if (bookResult.loading || meResult.loading) {
    return <div>loading...</div>
  }

  const books = bookResult.data.allBooks
  const myGenre = meResult.data.me.favoriteGenre
  const filteredBooks = books.filter((x) => x.genres.includes(myGenre))

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend
