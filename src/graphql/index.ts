import { useUserStore } from '@/stores/user'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

// Конфигурация URL сервера GraphQL
const GRAPHQL_ENDPOINT_API = 'https://your-graphql-endpoint.com/graphql'

// Настройка HTTP-ссылки
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT_API,
})

// Настройка авторизационной ссылки
const authLink = setContext((_, { headers }) => {
  const userStore = useUserStore()

  const token = userStore.accessTokenGetters
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Настройка errorLink для обработки ошибок
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`)
  }
})

// Создание Apollo Client с объединением ссылок
const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink), // Последовательное соединение ссылок
  cache: new InMemoryCache(), // Настройка кэша
})

export default client
