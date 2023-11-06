import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ALL_BOOKS, CREATE_BOOK } from "../queries";
import { updateCache } from "../App";

const BookForm = ({ setSelectedButton, setSelectedGenre }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(0);
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK, {
    onError: (error) => {
      console.log(error);
    },
    update: (cache, response) => {
      window.alert(
        `Title: ${response.data.addBook.title}\nauthor: ${
          response.data.addBook.author.name
        }\npublished: ${
          response.data.addBook.published
        }\ngenres: ${response.data.addBook.genres.map((g) => g)}`
      );
      updateCache(cache, { query: ALL_BOOKS }, response.data.addBook);
    },
  });

  const submit = async (e) => {
    e.preventDefault();

    if (title.length < 4 || author.length < 2) {
      console.log("the title and/or the author should be longer!");
    } else if (published <= 0) {
      console.log("fill in all fields correct!");
    } else {
      createBook({
        variables: {
          title,
          author,
          published: Number(published),
          genres,
        },
      });

      setSelectedButton(2);
      setSelectedGenre(null);
      setTitle("");
      setAuthor("");
      setPublished(0);
      setGenre("");
      setGenres([]);
    }
  };

  const handleGenre = (e) => {
    e.preventDefault();

    setGenres([...genres, genre]);
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
          <div>
            author
            <input
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
            />
          </div>
          <div>
            published
            <input
              type="number"
              min="1500"
              max="2099"
              step="1"
              value={published === 0 ? "" : published}
              onChange={({ target }) => setPublished(target.value)}
            />
          </div>
          <div>
            <input
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
            <button onClick={handleGenre} style={{ cursor: "pointer" }}>
              add genre
            </button>
          </div>
        </div>
        <div>
          {`genres: `}
          {genres.map((g, index) => (
            <span key={index}>{`${g} `}</span>
          ))}
        </div>
        <button type="submit" style={{ cursor: "pointer" }}>
          create book
        </button>
      </form>
    </div>
  );
};

export default BookForm;
