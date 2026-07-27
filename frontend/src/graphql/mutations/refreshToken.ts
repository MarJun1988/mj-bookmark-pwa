import { gql } from "@apollo/client";

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        id
        email
        role
        firstName
        lastName
        displayName
      }
    }
  }
`;
