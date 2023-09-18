import { useEffect, useState } from "react";
import { EDIT_BORN } from "../queries";
import { useMutation } from "@apollo/client";
import Select from "react-select";

const Authors = ({ authors }) => {
  const [born, setBorn] = useState(0);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [options, setOptions] = useState([]);

  const [changeBorn] = useMutation(EDIT_BORN);

  useEffect(() => {
    authors.map((p) => {
      return setOptions((options) => [
        ...options,
        { value: p.name, label: p.name },
      ]);
    });
  }, []);

  const submit = (e) => {
    console.log(born, "mitä", selectedAuthor);

    changeBorn({
      variables: { name: selectedAuthor.value, born: parseInt(born, 10) },
    });

    setSelectedAuthor(null);
    setBorn(0);
    e.preventDefault();
  };

  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            options={options}
          />
        </div>

        <div>
          born
          <input
            value={born === 0 ? "" : born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
