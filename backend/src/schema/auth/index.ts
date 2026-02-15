import { typeDefs } from "./typeDefs.js";
import { Mutation } from "./mutation.js";

export const authModule = {
  typeDefs,
  resolvers: {
    Mutation,
  },
};
