<script setup lang="ts">
import {
  NConfigProvider,
  NModalProvider,
  NNotificationProvider,
} from 'naive-ui';
import Main from '@/layout/Main.vue';

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
