import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: Email!, $password: String!) {
    login(email: $email, password: $password) {
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
