const {
  ApolloServer,
  AuthenticationError,
  UserInputError,
  gql,
} = require("apollo-server");
const config = require("./utils/config");
const mongoose = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const uri = config.MONGODB_URI;
mongoose
  .connect(uri)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    me: (root, args, context) => context.currentUser,
    authorCount: async () => await Author.count({}),
    allBooks: async (root, { author, genre }) => {
      let query = {};
      let authorObj = null;
      if (author) {
        authorObj = await Author.findOne({ name: author });
        if (!authorObj) {
          return null;
        }
      }
      if (author && genre) {
        query = {
          $and: [{ author: authorObj._id }, { genres: { $in: [genre] } }],
        };
      } else if (author) {
        query = { author: authorObj._id };
      } else if (genre) {
        query = { genres: { $in: [genre] } };
      }
      console.log(query);
      return Book.find(query).populate("author");
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      return authors.map((x) => {
        x.bookCount = books.filter((y) => y.author === x.name).length;
        return x;
      });
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const { title, author, published, genres } = args;
      try {
        let a = await Author.findOne({ name: author });
        if (!a) {
          const newAuthor = new Author({ name: author });
          a = await newAuthor.save();
        }
        const newBook = new Book({
          title,
          author: a._id,
          published,
          genres,
        });
        await newBook.save();
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        });
      }
    },
    editAuthor: (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const { name, setBornTo } = args;
      try {
        const author = authors.find((x) => x.name === name);
        if (author) {
          author.born = setBornTo;
          return author;
        }
        return null;
      } catch (e) {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        });
      }
    },
    createUser: async (root, args) => {
      const { username, favoriteGenre } = args;
      const user = new User({ username, favoriteGenre, password: "password" });

      return user.save().catch((e) => {
        throw new UserInputError(e.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username, password });
      if (!user) {
        throw new UserInputError("wrong credentials");
      }
      const userToken = {
        username,
        id: user._id,
      };

      return { value: jwt.sign(userToken, config.SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = jwt.verify(auth.substring(7), config.SECRET);
      const currentUser = await User.findById(token.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
