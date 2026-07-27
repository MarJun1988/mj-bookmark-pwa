import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@as-integrations/express5";

// ✅ funktioniert mit "type": "module" + NodeNext
import { buildHttpContext } from "./context.js";
import { pubsub } from "./pubsub.js";
import type { GraphQLFormattedError } from "graphql/error";
import type { GraphQLError } from "graphql";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { modules } from "./schema/index.js";

export const schema = makeExecutableSchema({
  typeDefs: modules.flatMap((m) => m.typeDefs),
  resolvers: modules.map((m) => m.resolvers),
});

export async function createApolloMiddleware() {
  const apollo = new ApolloServer({
    schema,
    includeStacktraceInErrorResponses: false,
    formatError: (formattedError: GraphQLFormattedError, error: unknown) => {
      // 🔒 Type Narrowing
      if (error instanceof Error) {
        const maybeGraphQLError = error as GraphQLError;
        const original = maybeGraphQLError.originalError;

        if (original instanceof PrismaClientKnownRequestError) {
          console.error("🔥 Prisma Error", {
            code: original.code,
            message: original.message,
            meta: original.meta,
          });
        } else {
          console.error("🔥 GraphQL Error", {
            message: error.message,
            stack: error.stack,
          });
        }
      } else {
        console.error("🔥 Unknown error type", error);
      }

      console.log("----------------");

      // 👇 das geht an den Client
      return formattedError;
    },
  });
  await apollo.start();

  return expressMiddleware(apollo, {
    context: async ({ req, res }) => buildHttpContext(req, res, pubsub),
  });
}

// context: async ({req}) => buildContext(req, pubsub)
