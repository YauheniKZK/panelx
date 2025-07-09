/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  
  declare module '*.json';
  declare module 'vue-the-mask';
  declare module 'vue-i18n';
  declare module '@jumpn/utils-graphql';
  declare module 'apollo-absinthe-upload-link'
  declare module '@/config'
  