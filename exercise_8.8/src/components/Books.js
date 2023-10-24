import React from "react";

const Books = ({ books }) => {
  return (
    <div>
      <h2>Books</h2>
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
    </div>
  );
};

export default Books;
