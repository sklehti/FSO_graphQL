const Book = require("./models/book");
const Author = require("./models/author");
const { GraphQLError } = require("graphql");
const { v1: uuid } = require("uuid");
const { name } = require("tar/lib/types");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

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

      const books = await Book.find(query).populate("author");

      return books;
    },

    allAuthors: async () => {
      return await Author.find({}).populate("bookCount");
    },

    me: (root, args, context) => {
      return {
        username: context.username,
        favoriteGenre: context.favoriteGenre,
      };
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

      pubsub.publish("BOOK_ADDED", { bookAdded: book });

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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
