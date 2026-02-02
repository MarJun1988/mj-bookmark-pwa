import {GraphQLScalarType} from "graphql/type";
import {isValidEmail} from "../../utils/utils.js";
import {GraphQLError, Kind} from "graphql";

export const EmailScalar = new GraphQLScalarType({
    name: 'Email',
    serialize: value => value,
    parseValue(value) {
        if (typeof value !== 'string' || !isValidEmail(value)) {
            throw new GraphQLError('Invalid email')
        }
        return value
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING || !isValidEmail(ast.value)) {
            throw new GraphQLError('Invalid email')
        }
        return ast.value
    }
})