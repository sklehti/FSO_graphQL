import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BOOK } from "../queries";

const BookForm = ({ setSelectedButton }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(0);
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK);

  const submit = async (e) => {
    e.preventDefault();

    createBook({
      variables: { title, author, published: parseInt(published, 10), genres },
    });

    setSelectedButton(2);
    setTitle("");
    setAuthor("");
    setPublished(0);
    setGenre("");
    setGenres([]);
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
              value={published === 0 ? "" : published}
              onChange={({ target }) => setPublished(target.value)}
            />
          </div>
          <div>
            <input
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
            <button onClick={handleGenre}>add genre</button>
          </div>
        </div>
        <div>
          {`genres: `}
          {genres.map((g, index) => (
            <span key={index}>{`${g} `}</span>
          ))}
        </div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default BookForm;
