import gql from 'graphql-tag'

export interface RegisterTelegramUserVariables {
  telegramId: any
  firstName: string
  lastName: string
  username: string
}

export interface RegisterTelegramUserResult {
  registerTelegramUser: {
    result: {
      accessToken: string
      refreshToken: string
      user: any
    } | null
    code: string
    message: any
    successful: boolean
  }
}

export const CREATE_TOKENS_USER = gql`
  mutation RegisterTelegramUser($email: String!, $password: String!) {
    registerTelegramUser(email: $email, password: $password) {
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
