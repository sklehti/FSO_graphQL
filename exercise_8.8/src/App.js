import { useApolloClient, useQuery } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS } from "./queries";
import Authors from "./components/Authors";
import { useEffect, useState } from "react";
import Books from "./components/Books";
import BookForm from "./components/BookForm";
import LoginForm from "./components/LoginForm";

const App = () => {
  const [token, setToken] = useState(null);
  const [selectedButton, setSelectedButton] = useState(1);

  const client = useApolloClient();

  const authorsResult = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  });
  const booksResult = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });

  useEffect(() => {
    // if (localStorage.getItem("books-user-token") !== null) {
    setToken(localStorage.getItem("books-user-token"));
    // }
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setSelectedButton(1);
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
        onClick={() => setSelectedButton(2)}
      >
        books
      </button>

      {!token ? (
        <button
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedButton(4)}
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
          <button onClick={logout}>logout</button>
        </>
      )}

      {selectedButton === 1 ? (
        <Authors authors={authorsResult.data.allAuthors} token={token} />
      ) : selectedButton === 2 ? (
        <Books books={booksResult.data.allBooks} />
      ) : selectedButton === 3 ? (
        <BookForm setSelectedButton={setSelectedButton} />
      ) : (
        <LoginForm setToken={setToken} setSelectedButton={setSelectedButton} />
      )}
    </div>
  );
};

export default App;
