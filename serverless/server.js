const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { TODO_LIST } = require("./makeData");
const { GraphQLError, GraphQLBoolean } = require("graphql");

/**
 * Gera um número inteiro para utilizar de id
 */
function getRandomInt() {
  return Math.floor(Math.random() * 999);
}

/**
 * Definição do schema GraphQL.
 * O tipo `Item` representa um item de uma lista de TODOs, com os campos `id` e `name`.
 * O input `ItemInput` é usado para adicionar ou atualizar itens na lista.
 * O input `ItemFilter` é usado para filtrar a lista de TODOs pelo nome.
 * A query `todoList` retorna uma lista de itens de TODOs, podendo ser filtrada pelo nome.
 * A mutation `addItem` adiciona um item na lista de TODOs.
 * A mutation `updateItem` atualiza um item na lista de TODOs.
 * A mutation `deleteItem` deleta um item da lista de TODOs.
 */
const typeDefs = `#graphql
  type Item {
    id: Int
    name: String
  }

  type Response {
    message: String
  }

  input ItemInput {
    id: Int
    name: String
  }

  input ItemFilter {
    name: String
  }

  type Query {
    todoList(filter: ItemFilter): [Item]
  }

  type Mutation {
    addItem(values: ItemInput): Response
    updateItem(values: ItemInput): Response
    deleteItem(id: Int!): Response
  }
`;

const resolvers = {
  Query: {
    /**
     * Retorna a lista de TODOs, podendo ser filtrada pelo nome.
     * Se o filtro `name` for fornecido, a pesquisa é feita de forma insensível a maiúsculas e minúsculas.
     * @param {Object} _ - O objeto raiz (não utilizado aqui).
     * @param {Object} filter - Filtro opcional contendo o nome a ser pesquisado.
     * @returns {Array} A lista de itens filtrados ou completa.
     */
    todoList: (_, { filter }) => {
      const { name } = filter || {};

      if (name && name.trim()) {
        return TODO_LIST.filter((item) =>
          item.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      return TODO_LIST;
    },
  },
  Mutation: {
    /**
     * Adiciona um item na lista de TODOs.
     * @param {Object} _ - O objeto raiz (não utilizado aqui).
     * @param {Object} values - Valores do item a ser adicionado.
     * @param {String} values.name - Nome do item a ser adicionado.
     * @returns {String} Mensagem de sucesso.
     * @throws {GraphQLError} Se o nome do item for nulo.
     * @throws {GraphQLError} Se o nome do item estiver em branco.
     * @throws {GraphQLError} Se o item já existir na lista.
     */
    addItem: (_, { values: { name } }) => {
      if (!name) {
        throw new GraphQLError("Nome do item não pode ser nulo", {
          extensions: { code: "ITEM_NAME_NULL", argumentName: "name" },
        });
      }

      if (!name.trim()) {
        throw new GraphQLError("Nome do item não pode estar em branco", {
          extensions: { code: "ITEM_NAME_BLANK", argumentName: "name" },
        });
      }

      if (TODO_LIST.find((item) => item.name === name)) {
        throw new GraphQLError("Item já existe na lista", {
          extensions: { code: "ITEM_ALREADY_EXISTS", argumentName: "name" },
        });
      }

      TODO_LIST.push({
        id: getRandomInt(),
        name,
      });

      return {
        message: "Item adicionado com sucesso",
      };
    },
    /**
     * Atualiza um item na lista de TODOs.
     * @param {Object} _ - O objeto raiz (não utilizado aqui).
     * @param {Object} values - Valores do item a ser atualizado.
     * @param {Number} values.id - ID do item a ser atualizado.
     * @param {String} values.name - Novo nome do item.
     * @returns {String} Mensagem de sucesso.
     * @throws {GraphQLError} Se o ID do item for nulo.
     * @throws {GraphQLError} Se o nome do item for nulo.
     * @throws {GraphQLError} Se o item não for encontrado.
     * @throws {GraphQLError} Se o novo nome do item já existir na lista.
     */
    updateItem: (_, { values: { id, name } }) => {
      if (!id) {
        throw new GraphQLError("ID do item não pode ser nulo", {
          extensions: { code: "ITEM_ID_NULL", argumentName: "id" },
        });
      }

      if (!name) {
        throw new GraphQLError("Nome do item não pode ser nulo", {
          extensions: { code: "ITEM_NAME_NULL", argumentName: "name" },
        });
      }

      if (TODO_LIST.find((item) => item.name === name && item.id !== id)) {
        throw new GraphQLError("Item já existe na lista", {
          extensions: { code: "ITEM_ALREADY_EXISTS", argumentName: "name" },
        });
      }

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        throw new GraphQLError("Item não encontrado", {
          extensions: { code: "ITEM_NOT_FOUND", argumentName: "id" },
        });
      }

      TODO_LIST[itemIndex].name = name;

      return {
        message: "Item atualizado com sucesso",
      };
    },
    /**
     * Deleta um item da lista de TODOs.
     * @param {Object} _ - O objeto raiz (não utilizado aqui).
     * @param {Number} id - ID do item a ser deletado.
     * @returns {String} Mensagem de sucesso.
     * @throws {GraphQLError} Se o ID do item for nulo.
     * @throws {GraphQLError} Se o item não for encontrado.
     */
    deleteItem: (_, { id }) => {
      if (!id) {
        throw new GraphQLError("ID do item não pode ser nulo", {
          extensions: { code: "ITEM_ID_NULL", argumentName: "id" },
        });
      }

      const itemIndex = TODO_LIST.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        throw new GraphQLError("Item não encontrado", {
          extensions: { code: "ITEM_NOT_FOUND", argumentName: "id" },
        });
      }

      TODO_LIST.splice(itemIndex, 1);

      return {
        message: "Item deletado com sucesso",
      };
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
