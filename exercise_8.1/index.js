const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Book = require("./models/book");
const Author = require("./models/author");
const { GraphQLError } = require("graphql");
const { name } = require("tar/lib/types");

const User = require("./models/user");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log("connecting to ", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB", error.message);
  });

const typeDefs = `
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
}

type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]
    id: ID!
}

type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]!  
    me: User
}

type Mutation {
  createUser(
    username: String!
    favoriteGenre: String!
  ): User

  login(
    username: String!
    password: String!
  ): Token

  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]
  ): Book

  editAuthor(
    name: String!
    setBornTo: Int!
  ): Author

}
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          query.author = author._id;
        }
      }
      if (args.genre) {
        query.genres = args.genre;
      }

      const books = await Book.find(query);
      let rigthBooks = await Promise.all(
        books.map(async (b) => {
          const rightAuthor = await Author.findOne({
            _id: b.author.toString(),
          });
          return { ...b._doc, author: rightAuthor };
        })
      );

      return rigthBooks;
    },

    allAuthors: async () => {
      return Author.find({});
    },

    me: (root, args, context) => {
      return { username: context.username };
    },
  },

  Author: {
    name: (root) => root.name,
    id: (root) => root.id,
    born: (root) => root.born,
    bookCount: async (root, args) =>
      (await Book.find({ author: root._id })).length,
  },

  Mutation: {
    createUser: async (root, args) => {
      const findUser = await User.findOne({ username: args.username });

      if (findUser) {
        throw new GraphQLError("username already exist", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
          },
        });
      }

      const user = new User({
        ...args,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_INPUT_ERROR",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },

    addBook: async (root, args, context) => {
      if (args.title.length < 4 || args.author.length < 2) {
        throw new GraphQLError("the title and the author should be longer!", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title.length < 4 ? args.title : args.author,
          },
        });
      }

      if (!context.username) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const person = await Author.findOne({ name: args.author });
      let book;

      try {
        if (!person) {
          const newAuthor = await Author.create({ name: args.author });
          book = new Book({ ...args, author: newAuthor });
          await book.save();
        } else {
          book = new Book({ ...args, author: person });
          await book.save();
        }
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: { ...book },
          },
        });
      }

      return book;
    },

    editAuthor: async (root, args, context) => {
      if (!context.username) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });
      let editAuthor = {};

      if (!author) {
        throw new GraphQLError("author not found");
      }

      try {
        const updatedAuthor = await Author.findOneAndUpdate(
          { name: author.name },
          { born: args.setBornTo }
        );

        editAuthor = await Author.findOne({ name: args.name });
      } catch (error) {
        throw new GraphQLError("Editing author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
          },
        });
      }

      return editAuthor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);

      return currentUser;
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
