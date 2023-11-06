import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS_SELECTED_GENRE, BOOK_ADDED } from "./queries";
import Authors from "./components/Authors";
import { useEffect, useState } from "react";
import Books from "./components/Books";
import BookForm from "./components/BookForm";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set();

    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [token, setToken] = useState(null);
  const [selectedButton, setSelectedButton] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.BOOK_ADDED;
      updateCache(client.cache, { query: ALL_BOOKS_SELECTED_GENRE }, addedBook);
    },
  });

  const authorsResult = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  });
  const booksResult = useQuery(ALL_BOOKS_SELECTED_GENRE, {
    variables: {
      genre: selectedGenre,
    },
    pollInterval: 2000,
  });

  useEffect(() => {
    if (token) {
      setToken(localStorage.getItem("books-user-token"));
    } else {
      setSelectedButton(1);
      localStorage.clear();
      client.resetStore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const logout = () => {
    setToken(null);
  };

  if (authorsResult.loading || booksResult.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <button
        style={{ cursor: "pointer" }}
        onClick={() => setSelectedButton(1)}
      >
        authors
      </button>
      <button
        style={{ cursor: "pointer" }}
        onClick={() => {
          setSelectedButton(2);
          setSelectedGenre(null);
        }}
      >
        books
      </button>

      {token === null ? (
        <button
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedButton(5)}
        >
          login
        </button>
      ) : (
        <>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedButton(3)}
          >
            add book
          </button>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedButton(4)}
          >
            recommend
          </button>
          <button onClick={logout} style={{ cursor: "pointer" }}>
            logout
          </button>
        </>
      )}

      {selectedButton === 1 ? (
        <Authors authors={authorsResult.data.allAuthors} token={token} />
      ) : selectedButton === 2 ? (
        <Books
          books={booksResult.data.allBooks}
          setSelectedGenre={setSelectedGenre}
          selectedGenre={selectedGenre}
        />
      ) : selectedButton === 3 ? (
        <BookForm
          setSelectedButton={setSelectedButton}
          setSelectedGenre={setSelectedGenre}
        />
      ) : selectedButton === 4 ? (
        <Recommendations token={token} />
      ) : (
        <LoginForm setToken={setToken} setSelectedButton={setSelectedButton} />
      )}
    </div>
  );
};

export default App;
