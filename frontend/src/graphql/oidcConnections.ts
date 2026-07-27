import { gql } from "@apollo/client";

export const OIDC_CONNECTIONS_QUERY = gql`
  query OidcConnections {
    me {
      id
      passwordLoginEnabled
    }
    myOidcIdentities {
      id
      issuer
      createdAt
    }
  }
`;

export const UNLINK_OIDC_IDENTITY_MUTATION = gql`
  mutation UnlinkOidcIdentity(
    $id: ID!
    $currentPassword: String
    $newPassword: String
    $newPasswordReplay: String
  ) {
    unlinkOidcIdentity(
      id: $id
      currentPassword: $currentPassword
      newPassword: $newPassword
      newPasswordReplay: $newPasswordReplay
    )
  }
`;
