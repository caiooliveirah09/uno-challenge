const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");

/**
 * Gera um número inteiro para utilizar de id
 */
function getRandomInt() {
  return Math.floor(Math.random() * 999);
}

const typeDefs = `#graphql
  type Item {
    id: Int
    name: String
  }

  input ItemInput {
    id: Int
    name: String
  }

  input ItemFilter {
    id: Int
    name: String
  }

  type Query {
    todoList(filter: ItemFilter): [Item]
  }

  type Mutation {
    addItem(values: ItemInput): Boolean
    updateItem(values: ItemInput): Boolean
    deleteItem(id: Int!): Boolean
  }
`;

const resolvers = {
  Query: {
    todoList: (_, { filter }) => {
      // Aqui você irá implementar o filtro dos itens
      console.log(filter);
      return TODO_LIST;
    },
  },
  Mutation: {
    addItem: (_, { values: { name } }) => {
      if (TODO_LIST.find((item) => item.name === name)) return false;

      TODO_LIST.push({
        id: getRandomInt(),
        name,
      });
    },
    updateItem: (_, { values: { id, name } }) => {
      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);
      if (itemIndex === -1) return false;
      TODO_LIST[itemIndex].name = name;
      return true;
    },
    deleteItem: (_, { id }) => {
      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);
      if (itemIndex === -1) return false;
      TODO_LIST.splice(itemIndex, 1);
      return true;
    },
  },
};

// Configuração para subir o backend
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
