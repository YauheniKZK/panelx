import gql from 'graphql-tag'

export interface RoleItem {
  id: number
  name: string
  countUsers: number
}

export interface GetAuthenticatedUserResult {
  getAuthenticatedUser: {
    result: {
      id: number
      firstName: string
      lastName: string
      email: string
      roles: RoleItem[]
    } | null
    code: string
    message: any
    successful: boolean
  }
}

export const GET_CURRENT_USER = gql`
  query GetAuthenticatedUser {
    getAuthenticatedUser {
      result {
        id
        firstName
        lastName
        email
        roles {
          id
          name
        }
      }
      successful
      code
      message
    }
  }
`
