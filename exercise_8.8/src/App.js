import { useQuery } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS } from "./queries";
import Authors from "./components/Authors";
import { useState } from "react";
import Books from "./components/Books";
import BookForm from "./components/BookForm";

const App = () => {
  const authorsResult = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  });
  const booksResult = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });
  const [selectedButton, setSelectedButton] = useState(1);

  if (authorsResult.loading && booksResult.loading) {
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
      <button
        style={{ cursor: "pointer" }}
        onClick={() => setSelectedButton(3)}
      >
        add book
      </button>

      {selectedButton === 1 ? (
        <Authors authors={authorsResult.data.allAuthors} />
      ) : selectedButton === 2 ? (
        <Books books={booksResult.data.allBooks} />
      ) : (
        <BookForm />
      )}
    </div>
  );
};

export default App;
