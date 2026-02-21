<template>
  <div class="w-80 border-r p-4">
    <div class="flex justify-center mb-4">
      <div class="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">👤</div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="label">EMP_NO</label>
        <input :value="employee.cardNo" readonly class="input" />
      </div>
      <div>
        <label class="label">EMP_NAME</label>
        <input :value="employee.fullName" readonly class="input" />
      </div>
      <div>
        <label class="label">DEPARTMENT</label>
        <input :value="employee.department" readonly class="input" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ employee: { cardNo: string; fullName: string; department: string } }>()
</script>
