import gql from 'graphql-tag'

export interface CreateTokensUserVariables {
  email: string
  password: string
}

export interface CreateTokensUserResult {
  createTokensUser: {
    result: {
      accessToken: string
      refreshToken: string
    } | null
    code: string
    message: any
    successful: boolean
  }
}

export const CREATE_TOKENS_USER = gql`
  mutation CreateTokensUser($email: String!, $password: String!) {
    createTokensUser(email: $email, password: $password) {
      result {
        accessToken
        refreshToken
      }
      successful
      code
      message
    }
  }
`
