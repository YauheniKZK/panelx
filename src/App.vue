<script setup lang="ts">
import {
  NConfigProvider,
  NModalProvider,
  NNotificationProvider,
} from 'naive-ui';
import Main from '@/layout/Main.vue';
import WebApp from '@twa-dev/sdk'
import { onMounted } from 'vue';

onMounted(() => {
  WebApp.expand()
})

</script>

<template>
  <n-config-provider class="flex flex-col grow">
    <n-notification-provider>
      <n-modal-provider>
        <Main
          class="flex flex-col grow"
        />
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped></style>
