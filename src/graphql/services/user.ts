import type { FetchResult } from '@apollo/client'
import { CREATE_TOKENS_USER, CreateTokensUserResult, CreateTokensUserVariables } from "../mutations/create-tokens-user"
import { Config } from "@/config"
import client from '../index'
import { REFRESH_TOKEN_USER, RefreshTokenUserResult } from '../mutations/refresh-token'
import { GET_CURRENT_USER, GetAuthenticatedUserResult } from '../queries/get-authenticated-user'

const loginAdmin = async (
  payload: CreateTokensUserVariables
): Promise<FetchResult<CreateTokensUserResult>> => {
  return await client.mutate({
    mutation: CREATE_TOKENS_USER,
    variables: {
      ...payload
    },
    context: {
      uri: `${Config.GRAPHQL_ENDPOINT}`
    }
  })
}

const regreshToken = async (
  refreshToken: string
): Promise<FetchResult<RefreshTokenUserResult>> => {
  return await client.mutate({
    mutation: REFRESH_TOKEN_USER,
    variables: {
      refreshToken
    },
    context: {
      uri: `${Config.GRAPHQL_ENDPOINT}`
    }
  })
}

const getCurrentUser = async (): Promise<FetchResult<GetAuthenticatedUserResult>> => {
  return await client.query({
    query: GET_CURRENT_USER,
    variables: {},
    context: {
      uri: `${Config.GRAPHQL_ENDPOINT}`
    },
    fetchPolicy: 'no-cache'
  })
}

export {
  loginAdmin,
  regreshToken,
  getCurrentUser
}