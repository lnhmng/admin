<!-- <template>
  <input
    ref="input"
    v-model="model"
    @keyup.enter="$emit('enter')"
    :placeholder="placeholder"
    class="w-full h-10 rounded-full bg-gray-100 px-4 text-sm"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps<{ modelValue: string; placeholder: string }>()
const emit = defineEmits(['update:modelValue', 'enter'])

const input = ref<HTMLInputElement | null>(null)
const model = ref(props.modelValue)

watch(model, v => emit('update:modelValue', v))
</script> -->
