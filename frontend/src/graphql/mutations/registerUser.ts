import { gql } from "@apollo/client";

export const REGISTER_USER_MUTATION = gql`
  mutation RegisterUser(
    $email: Email!
    $password: String!
    $passwordReplay: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUser(
      email: $email
      password: $password
      passwordReplay: $passwordReplay
      firstName: $firstName
      lastName: $lastName
    ) {
      user {
        id
        email
        displayName
      }
    }
  }
`;
