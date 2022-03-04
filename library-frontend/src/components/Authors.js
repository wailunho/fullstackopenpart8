import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR)
  const [name, setName] = useState('')
  const [born, setBorn] = useState(0)

  const handleUpdate = async (e) => {
    e.preventDefault()
    await editAuthor({ variables: { name, setBornTo: born } })
    setBorn(0)
    setName('')
  }

  if (!props.show) {
    return null
  }
  if (result.loading) {
    return <div>loading...</div>
  }
  const authors = result.data.allAuthors
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <div>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {authors.map((x) => (
            <option key={x.id} value={x.name}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        born{' '}
        <input
          type="number"
          value={born}
          onChange={(e) => setBorn(Number(e.target.value))}
        />
      </div>
      <div>
        <button onClick={handleUpdate}>update author</button>
      </div>
    </div>
  )
}

export default Authors
