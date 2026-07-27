import { GraphQLDateTime } from "graphql-scalars";
import GraphQLJSON from "graphql-type-json";

export const scalarResolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
};
