import { gql } from "@apollo/client";

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!, $newPasswordReplay: String!) {
    resetPassword(token: $token, newPassword: $newPassword, newPasswordReplay: $newPasswordReplay)
  }
`;
