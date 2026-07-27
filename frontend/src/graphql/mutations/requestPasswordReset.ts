import { gql } from "@apollo/client";

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: Email!) {
    requestPasswordReset(email: $email)
  }
`;
