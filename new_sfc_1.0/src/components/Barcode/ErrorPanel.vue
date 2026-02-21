<template>
  <div class="error-panel-wrapper">
    <div v-if="hasImportFail" class="panel red">
      <div class="title red">❌ Lỗi Import SN</div>
      <div v-for="(sns, msg) in importErrors" :key="msg" class="row">
        <span class="badge red">{{ sns.length }} SN</span>
        <span>{{ msg }}</span>
      </div>
    </div>

    <div v-if="hasReworkFail" class="panel purple">
      <div class="title purple">❌ Lỗi Rework SN</div>
      <div v-for="(sns, msg) in reworkErrors" :key="msg" class="row">
        <span class="badge purple">{{ sns.length }} SN</span>
        <span>{{ msg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  importErrors: Record<string, string[]>
  reworkErrors: Record<string, string[]>
}>()

const hasImportFail = computed(() => Object.keys(props.importErrors).length)
const hasReworkFail = computed(() => Object.keys(props.reworkErrors).length)
</script>
