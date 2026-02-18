import { gql } from "@apollo/client";

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($email: Email!, $password: String!) {
    deleteAccount(email: $email, password: $password)
  }
`;
