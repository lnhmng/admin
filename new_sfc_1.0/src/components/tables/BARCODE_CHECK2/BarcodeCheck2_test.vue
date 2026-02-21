<!-- <template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <ErrorPanel :importErrors="failedSNGroups" :reworkErrors="failedReworkGroups" />

    <ScanInput
      ref="scanInput"
      v-model="scanValue"
      :placeholder="currentPlaceholder"
      @enter="handleScan"
    />

    <div class="flex bg-white rounded shadow min-h-[560px] mt-4">
      <EmployeePanel :employee="employee" />

      <div class="flex-1 p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">LINE_NAME</label>
            <input :value="station.locationCode" readonly class="input" />
          </div>
          <div>
            <label class="label">SN</label>
            <input :value="scan.sn" readonly class="input" />
          </div>
          <div>
            <label class="label">MO REWORK</label>
            <input :value="scan.newMo" readonly class="input" />
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <button :disabled="step !== 5" @click="doRework" class="btn primary">REWORK</button>
        </div>

        <LogTable :logs="logs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ScanInput from '@/components/Barcode/ScanInput.vue'
import EmployeePanel from '@/components/Barcode/EmployeePanel.vue'
import ErrorPanel from '@/components/Barcode/ErrorPanel.vue'
import LogTable from '@/components/Barcode/LogTable.vue'
import { useBarcodeCheck2 } from '@/composables/useBarcodeCheck2'

const {
  step,
  scanValue,
  currentPlaceholder,
  station,
  employee,
  scan,
  logs,
  failedSNGroups,
  failedReworkGroups,
  handleScan,
  doRework
} = useBarcodeCheck2()
</script> -->
