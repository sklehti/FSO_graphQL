import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ALL_BOOKS_SELECTED_GENRE, USER_INFO } from "../queries";

const Recommendations = ({ token }) => {
  const [genre, setGenre] = useState(null);
  const userResult = useQuery(USER_INFO, {
    skip: !token,
  });

  const booksResult = useQuery(ALL_BOOKS_SELECTED_GENRE, {
    variables: {
      genre: genre,
    },
    pollInterval: 2000,
  });

  useEffect(() => {
    if (userResult.data && userResult.data.me) {
      setGenre(userResult.data.me.favoriteGenre);
    }
  }, [userResult, genre]);

  if (booksResult.loading || userResult.loading) {
    return <></>;
  }

  if (userResult.error) return <p>Error...</p>;

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <b>{genre}</b>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>authors</th>
            <th>published</th>
          </tr>
          {booksResult.data.allBooks.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
