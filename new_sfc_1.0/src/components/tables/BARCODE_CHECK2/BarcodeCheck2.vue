<template>
  <div class="p-4 bg-gray-50 min-h-screen">

    <!-- ALERT -->
    <div class="mb-3 flex items-center gap-2 px-4 py-2 rounded" :class="alert.type">
      <span class="text-lg">⚠</span>
      <span>{{ alert.message }}</span>
    </div>

    <!-- INPUT SCAN -->
    <div class="mb-4 flex gap-2">
      <select v-if="step === 1" v-model="station.locationCode" @change="handleLineChange" :disabled="isLoadingLines"
        class="w-full h-10 rounded-full bg-white border-2 border-blue-400 px-4 text-sm">
        <option value="">{{ isLoadingLines ? 'Loading...' : '-- CHOOSE LINE / STATION --' }}</option>
        <option v-for="line in lineOptions" :key="line" :value="line">{{ line }}</option>
      </select>

      <input v-else ref="scanInput" v-model="scanValue" @keyup.enter="handleScan" :placeholder="currentPlaceholder"
        class="w-full h-10 rounded-full bg-gray-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>

    <div class="flex bg-white rounded shadow min-h-[560px]">

      <!-- LEFT: EMP INFO -->
      <div class="w-80 border-r p-4">
        <div class="flex justify-center mb-4">
          <div class="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">
            <span class="text-gray-400 text-4xl">👤</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label">EMP_NO</label>
            <input v-model="employee.cardNo" readonly class="input" />
          </div>
          <div>
            <label class="label">EMP_NAME</label>
            <input v-model="employee.fullName" readonly class="input" />
          </div>
          <div>
            <label class="label">DEPARTMENT</label>
            <input v-model="employee.department" readonly class="input" />
          </div>
        </div>
      </div>

      <!-- RIGHT: STATION + SN -->
      <div class="flex-1 p-4">

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">LINE / STATION</label>
            <input v-model="station.locationCode" readonly class="input" />
          </div>

          <div>
            <label class="label">SN</label>
            <input v-model="scan.sn" readonly class="input" />
          </div>
        </div>

        <div class="mt-4 flex gap-3 items-center">
          <select v-model="rescanStep" class="h-9 rounded bg-gray-100 px-2 text-sm">
            <option disabled value="">RESCAN</option>
            <option v-for="s in stepOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>

          <button :disabled="!rescanStep" @click="rescanSelected"
            class="px-4 py-2 rounded bg-yellow-500 text-white disabled:bg-gray-300">
            CONFIRM
          </button>
        </div>

        <!-- LOG -->
        <div class="mt-6 border-t pt-3">
          <span class="text-blue-500 border-b-2 border-blue-500 pb-1 text-sm">
            Nhật ký thao tác
          </span>
        </div>

        <div v-if="logs.length === 0" class="text-gray-500 text-sm mt-2">
          Chưa có nhật ký
        </div>

        <table v-else class="w-full text-sm border-collapse mt-2">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-3 py-2 text-left">Time</th>
              <th class="border px-3 py-2 text-left">Content</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, i) in logs" :key="i">
              <td class="border px-3 py-2">{{ log.time }}</td>
              <td class="border px-3 py-2">{{ log.action }}</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// const BASE_URL = 'https://localhost:44361/barcode-check2'
const BASE_URL = 'http://10.81.171.15:8184/api/barcode-check2'

const lineOptions = ref([])

const step = ref(1)
const scanValue = ref('')
const scanInput = ref(null)
const rescanStep = ref('')

const station = ref({ locationCode: '' })
const employee = ref({ cardNo: '', fullName: '', department: '' })
const scan = ref({ sn: '' })
const logs = ref([])

const AUTO_RESET_MS = 5 * 60 * 1000 
let idleTimer = null

function startIdleTimer() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => {
    addLog('Timeout')
    alertInfo('Timeout -> Back to Step 1')
    resetAll()
    focusScan()
  }, AUTO_RESET_MS)
}

const alert = ref({
  type: 'bg-orange-50 text-orange-600',
  message: 'Please select LINE_NAME from the list',
  hasFail: false
})

function handleLineChange() {
  if (!station.value.locationCode) return

  const val = station.value.locationCode
  addLog(`Selected LINE: ${val}`)
  alertSuccess('LINE OK → Please Input Employee ID')
  step.value = 2
  focusScan()
}

const isLoadingLines = ref(false)

async function fetchLines() {
  isLoadingLines.value = true
  try {
    const res = await axios.get(`${BASE_URL}/get-lines`)
    lineOptions.value = res.data.data
  } finally {
    isLoadingLines.value = false
  }
}

const stepOptions = computed(() => [
  { value: 1, label: 'Change Line / Station' },
  { value: 2, label: 'Input Employee ID' },
  { value: 3, label: 'Input SN' },
  { value: 4, label: 'INPUT PACKINGSN' },
  { value: 5, label: 'INPUT BIDUI SN' }
].filter(s => s.value < step.value))

const currentPlaceholder = computed(() => {
  switch (step.value) {
    case 1: return 'Choose Line / Station'
    case 2: return 'Input Employee ID'
    case 3: return 'Input SN'
    case 4: return 'INPUT PACKINGSN'
    case 5: return 'INPUT BIDUI SN'
    default: return ''
  }
})

function addLog(text) {
  logs.value.unshift({
    time: new Date().toLocaleString(),
    action: text
  })
}

function alertInfo(msg) {
  alert.value = { type: 'bg-orange-50 text-orange-600', message: msg, hasFail: false }
}

function alertSuccess(msg) {
  alert.value = { type: 'bg-green-50 text-green-600', message: msg, hasFail: false }
}

function focusScan() {
  requestAnimationFrame(() => {
    scanInput.value?.focus()
  })
}

function handleScan() {
  const val = scanValue.value.trim()
  if (!val) return

  startIdleTimer()

  if (step.value === 1) scanLocation(val)
  else if (step.value === 2) scanEmp(val)
  else if (step.value === 3) scanSN(val)
  else if (step.value === 4) scanBidui1(val)
  else if (step.value === 5) scanBidui2(val)
  scanValue.value = ''
}

function scanLocation(val) {
  resetAll()
  station.value.locationCode = val
  addLog(`Scan LINE: ${val}`)
  alertSuccess('LINE OK → Input Employee ID')
  step.value = 2
}

async function scanEmp(val) {
  addLog(`Scan EMP: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/check-emp`, { empNo: val })
    if (!res.data.success) {
      addLog(`❌ EMP ${val}: ${res.data.message}`)
      alertInfo(res.data.message)
      return
    }

    employee.value = {
      cardNo: val,
      fullName: res.data.fullName || '',
      department: res.data.department || ''
    }

    addLog(`✅ EMP ${val} OK`)
    alertSuccess('EMP OK → Input SN')
    step.value = 3
  } catch {
    alertInfo('Server Error')
  }
}

async function scanSN(val) {
  addLog(`Input SN: ${val}`)

  try {
    let res1 = await axios.post(`${BASE_URL}/check-route`, {
      data: val,
      group: 'BARCODE_CHECK2',
      line: station.value.locationCode
    })

    if (!res1.data.success) {
      addLog(`❌ CHECK_ROUTE_V1 NG: ${res1.data.message}`)
      alertInfo(res1.data.message)
      return
    }

    addLog(`✅ CHECK_ROUTE_V1 OK: ${val}`)

    let res2 = await axios.post(`${BASE_URL}/check-packing-sn`, {
      data: val,
      emp: employee.value.cardNo,
      line: station.value.locationCode,
      group: 'BARCODE_CHECK2',
    })

    if (!res2.data.success) {
      addLog(`❌ CHECK_PACKINGSN_V1 NG: ${res2.data.message}`)
      alertInfo(res2.data.message)
      return
    }

    addLog(`✅ CHECK_PACKINGSN_V1 OK: ${val}`)

    scan.value.sn = val
    alertSuccess('SN OK → INPUT PACKINGSN')
    step.value = 4
    focusScan()
  } catch (e) {
    alertInfo('Server Error')
  }
}

async function scanBidui1(val) {
  addLog(`Scan Data: ${val}`)

  try {
    let res1 = await axios.post(`${BASE_URL}/bidui-sn1`, {
      data: val,
      group: 'BARCODE_CHECK2',
    })

    if (!res1.data.success) {
      addLog(`❌ CHECK_BIDUI_SN1 NG: ${res1.data.message}`)
      alertInfo(res1.data.message)
      return
    }

    addLog(`✅ CHECK_BIDUI_SN1 OK: ${val}`)

    scan.value.data = val
    alertSuccess('PACKINGSN PASS ✔')
    step.value = 5
    focusScan()
  } catch (e) {
    alertInfo('Server Error')
  }
}

async function scanBidui2(val) {
  addLog(`Scan Data: ${val}`)

  try {
    let res1 = await axios.post(`${BASE_URL}/bidui-sn2`, {
      data: val,
      group: 'BARCODE_CHECK2',
    })

    if (!res1.data.success) {
      addLog(`❌ CHECK_BIDUI_SN2 NG: ${res1.data.message}`)
      alertInfo(res1.data.message)
      return
    }

    addLog(`✅ CHECK_BIDUI_SN2 OK: ${val}`)

    let res2 = await axios.post(`${BASE_URL}/check-sn-next-station`, {
      data: val,
      emp: employee.value.cardNo,
      group: 'BARCODE_CHECK2',
    })

    if (!res2.data.success) {
      addLog(`❌ CHECK_SN_NEXT_STATION NG: ${res2.data.message}`)
      alertInfo(res2.data.message)
      return
    }

    addLog(`✅ CHECK_SN_NEXT_STATION OK: ${val}`)

    scan.value.data = val
    alertSuccess('BIDUI SN PASS ✔')
    step.value = 3
    focusScan()
  } catch (e) {
    alertInfo('Server Error')
  }
}

function rescanSelected() {
  const target = Number(rescanStep.value)

  if (target === 1) {
    resetAll()
  }

  if (target === 2) {
    employee.value = { cardNo: '', fullName: '', department: '' }
    scan.value = { sn: '', data: '' }
  }

  if (target === 3) {
    scan.value = { sn: '', data: '' }
  }

  if (target === 4) {
    scan.value.data = ''
  }

  step.value = target
  rescanStep.value = ''
  alertInfo(`Rescan → ${stepName(target)}`)
  focusScan()
}

function stepName(s) {
  switch (s) {
    case 1: return 'Line / Station'
    case 2: return 'EMP'
    case 3: return 'SN'
    case 4: return 'PACKINGSN'
    case 5: return 'BIDUI SN'
    default: return ''
  }
}

function resetAll() {
  clearTimeout(idleTimer)
  step.value = 1
  station.value = { locationCode: '' }
  employee.value = { cardNo: '', fullName: '', department: '' }
  scan.value = { sn: '' }
  logs.value = []
}

onMounted(() => {
  fetchLines()
  focusScan()
  startIdleTimer()
})
</script>



<style scoped>
.input {
  width: 100%;
  height: 36px;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px
}

.label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px
}

.error-panel-wrapper {
  margin-bottom: 20px;
}

.error-panel {
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.error-panel.import {
  border: 1px solid #fee2e2;
}

.error-panel.rework {
  border: 1px solid #ede9fe;
}
</style>


<style scoped>
.input {
  width: 100%;
  height: 36px;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px
}

.label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px
}

.error-panel-wrapper {
  margin-bottom: 20px;
}

.error-panel {
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.error-panel.import {
  border: 1px solid #fee2e2;
}

.error-panel.rework {
  border: 1px solid #ede9fe;
}
</style>
