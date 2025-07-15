import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { getCurrentUser, loginAdmin, regreshToken } from '@/graphql/services/user'
import { CreateTokensUserVariables } from '@/graphql/mutations/create-tokens-user'
import router from '@/router'

export const useUserStore = defineStore('user', () => {

  // -----------------STATE---------------------

  const accessToken = ref<string | null>(null)
  const currentUser = ref<any | null>(null)

  // -----------------GETTERS---------------------

  const currentUserGetters = computed(() => currentUser.value)
  const accessTokenGetters = computed(() => accessToken.value)
 
  // -----------------ACTION---------------------

  async function loginAction(paylaod: CreateTokensUserVariables) {
    try {
      const res = await loginAdmin(paylaod)
      if (res?.data?.createTokensUser?.successful) {
        accessToken.value = res?.data?.createTokensUser?.result?.accessToken || null
        if (res?.data?.createTokensUser?.result?.refreshToken) {
          setRefreshToken(res.data.createTokensUser.result.refreshToken)
        }
        router.push({ path: '/' })
      } else {
        logoutAction()
      }
    } catch (error) {
      logoutAction()
      console.log('error', error)
    }
  }

  async function refreshTokenAction(refreshToken: string) {
    try {
      const res = await regreshToken(refreshToken)
      if (res?.data?.refreshToken?.successful) {
        accessToken.value = res?.data?.refreshToken?.result?.accessToken || null
        if (res?.data?.refreshToken?.result?.refreshToken) {
          setRefreshToken(res.data.refreshToken.result.refreshToken)
        }
      } else {
        logoutAction()
      }
    } catch (error) {
      logoutAction()
      console.log('error', error)
    }
  }

  async function getCurrentUserAction() {
    try {
      const res = await getCurrentUser()
      if (res.data?.getAuthenticatedUser.successful) {
        console.log('res.data', res.data)
        currentUser.value = res.data.getAuthenticatedUser.result
      } else {
        console.log('res.data', res.data)
        currentUser.value = null
      }
    } catch (error) {
      currentUser.value = null
      console.log('error', error)
    }
  }

  function logoutAction() {
    localStorage.clear()
    sessionStorage.clear()
    removeRefreshToken()
    accessToken.value = null
    router.push({ path: '/login' })
  }

  function setCurrentUser(user: any) {
    currentUser.value = user
  }

  function setAccessToken(token: string) {
    accessToken.value = token
  }

  function setRefreshToken(token: string) {
    Cookies.set('refreshTokenAdmin', token, { expires: 1 }) 
  }

  function removeRefreshToken() {
    Cookies.remove('refreshTokenAdmin') 
  }

  function getRefreshToken() {
    return Cookies.get('refreshTokenAdmin')
  }

  return {
    setCurrentUser,
    currentUserGetters,
    accessTokenGetters,
    setAccessToken,
    loginAction,
    getRefreshToken,
    refreshTokenAction,
    logoutAction,
    getCurrentUserAction
  }
})
