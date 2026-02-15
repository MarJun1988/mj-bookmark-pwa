import { typeDefs } from "./typeDefs.js";
import { Query } from "./query.js";
import { Mutation } from "./mutation.js";
import { Subscription } from "./subscription.js";

export const tagModule = {
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    Subscription,
  },
};
