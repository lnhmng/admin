<template>
  <div class="mt-6">
    <div class="text-blue-500 border-b pb-1 text-sm">Nhật ký thao tác</div>

    <div v-if="!logs.length" class="text-sm text-gray-400 mt-2">Chưa có nhật ký</div>

    <table v-else class="w-full text-sm mt-2">
      <tr v-for="(log, i) in logs" :key="i">
        <td class="border px-2 py-1">{{ log.time }}</td>
        <td class="border px-2 py-1">{{ log.action }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{ logs: { time: string; action: string }[] }>()
</script>
