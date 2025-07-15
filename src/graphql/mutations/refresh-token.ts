import gql from 'graphql-tag'

export interface RefreshTokenUserResult {
  refreshToken: {
    result: {
      accessToken: string
      refreshToken: string
    } | null
    code: string
    message: any
    successful: boolean
  }
}

export const REFRESH_TOKEN_USER = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
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
