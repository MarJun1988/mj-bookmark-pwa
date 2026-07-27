import { gql } from "@apollo/client";

export const REQUEST_DATA_EXPORT = gql`
  mutation RequestDataExport($email: Email!, $password: String!) {
    requestDataExport(email: $email, password: $password) {
      filename
      mimeType
      contentBase64
    }
  }
`;
