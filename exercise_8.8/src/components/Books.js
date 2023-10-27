import React, { useState } from "react";
import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const Books = ({ books, setSelectedGenre, selectedGenre }) => {
  const [allGenres, setAllGenres] = useState([]);

  const all = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });

  if (!all.loading) {
    all.data.allBooks.map((b) =>
      b.genres.map((g) =>
        g !== null && !allGenres.includes(g)
          ? setAllGenres([...allGenres, g])
          : null
      )
    );
  }

  const handleGenre = (e) => {
    setSelectedGenre(e.target.value);
  };

  return (
    <div>
      <h2>Books</h2>

      {selectedGenre ? (
        <div>
          in genre <b>{selectedGenre}</b>
        </div>
      ) : (
        <></>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>authors</th>
            <th>published</th>
          </tr>
          {books.map((b, index) => (
            <tr key={index}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {allGenres.map((g) => (
        <button
          key={g}
          value={g}
          onClick={handleGenre}
          style={{ cursor: "pointer" }}
        >
          {g}
        </button>
      ))}
    </div>
  );
};

export default Books;
