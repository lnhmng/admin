<template>
  <div class="p-4 bg-gray-50 min-h-screen">

    <!-- ALERT -->
    <div class="mb-3 flex items-center gap-2 px-4 py-2 rounded"
         :class="alert.type">
      <span class="text-lg">⚠</span>
      <span>{{ alert.message }}</span>
    </div>

    <!-- SINGLE SCAN INPUT -->
    <div class="mb-4">
      <input
        ref="scanInput"
        v-model="scanValue"
        @keyup.enter="handleScan"
        placeholder="Scan LOCATION / EMP / SN / MO"
        class="w-full h-10 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>

    <!-- MAIN -->
    <div class="flex bg-white rounded shadow min-h-[540px]">

      <!-- LEFT : EMP -->
      <div class="w-80 border-r p-4">
        <div class="flex justify-center mb-4">
          <div class="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">
            <span class="text-gray-400 text-4xl">👤</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label">Số thẻ nhân viên</label>
            <input v-model="employee.cardNo" readonly class="input" />
          </div>
          <div>
            <label class="label">Tên đầy đủ</label>
            <input v-model="employee.fullName" readonly class="input" />
          </div>
          <div>
            <label class="label">Bộ phận</label>
            <input v-model="employee.department" readonly class="input" />
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex-1 p-4">

        <!-- DATA VIEW -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">LOCATION</label>
            <input v-model="station.locationCode" readonly class="input" />
          </div>
          <div>
            <label class="label">SN</label>
            <input v-model="scan.sn" readonly class="input" />
          </div>
          <div>
            <label class="label">MO hiện tại</label>
            <input v-model="snInfo.currentMo" readonly class="input" />
          </div>
          <div>
            <label class="label">MO mới</label>
            <input v-model="scan.newMo" readonly class="input" />
          </div>
        </div>

        <!-- ACTION -->
        <div class="mt-4 flex gap-3">
          <button
            :disabled="step !== 5"
            @click="doRework"
            class="px-6 py-2 rounded text-white bg-blue-500 disabled:bg-gray-300">
            REWORK
          </button>

          <!-- RESCAN -->
          <select
            v-model="rescanStep"
            class="h-9 rounded bg-gray-100 px-2 text-sm">
            <option disabled value="">Scan lại bước</option>
            <option v-for="s in stepOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>

          <button
            :disabled="!rescanStep"
            @click="rescanSelected"
            class="px-4 py-2 rounded bg-yellow-500 text-white disabled:bg-gray-300">
            Xác nhận
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
              <th class="border px-3 py-2 text-left">Thời gian</th>
              <th class="border px-3 py-2 text-left">Nội dung</th>
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
import { ref, onMounted, computed } from 'vue'

/**
 * STEP
 * 1 = LOCATION
 * 2 = EMP
 * 3 = SN
 * 4 = MO
 * 5 = READY
 */
const step = ref(1)
const scanValue = ref('')
const scanInput = ref(null)
const rescanStep = ref('')

const alert = ref({
  type: 'bg-orange-50 text-orange-600',
  message: 'Vui lòng scan LOCATION'
})

const station = ref({ locationCode: '', line: '', group: '' })
const employee = ref({ cardNo: '', fullName: '', department: '' })
const scan = ref({ sn: '', newMo: '' })
const snInfo = ref({ currentMo: '', model: '', currentGroup: '' })
const logs = ref([])

/* ===== OPTIONS ===== */
const stepOptions = computed(() => [
  { value: 1, label: 'LOCATION' },
  { value: 2, label: 'EMP' },
  { value: 3, label: 'SN' },
  { value: 4, label: 'MO' }
].filter(s => s.value <= step.value))

/* ===== HELPERS ===== */
function addLog(text) {
  logs.value.unshift({ time: new Date().toLocaleString(), action: text })
}
function alertInfo(msg) {
  alert.value = { type: 'bg-orange-50 text-orange-600', message: msg }
}
function alertSuccess(msg) {
  alert.value = { type: 'bg-green-50 text-green-600', message: msg }
}
function focusScan() {
  setTimeout(() => scanInput.value?.focus(), 50)
}

/* ===== SCAN CORE ===== */
function handleScan() {
  const val = scanValue.value.trim()
  if (!val) return

  switch (step.value) {
    case 1: scanLocation(val); break
    case 2: scanEmp(val); break
    case 3: scanSN(val); break
    case 4: scanMO(val); break
  }
  scanValue.value = ''
}

/* ===== STEP LOGIC ===== */
function scanLocation(val) {
  station.value.locationCode = val
  station.value.line = 'LINE01'
  station.value.group = 'REWORK'
  addLog(`Scan LOCATION: ${val}`)
  alertSuccess('LOCATION OK → scan EMP')
  step.value = 2
}

function scanEmp(val) {
  employee.value = {
    cardNo: val,
    fullName: '阮孟玲',
    department: '现场服务一组'
  }
  addLog(`Scan EMP: ${val}`)
  alertSuccess('EMP OK → scan SN')
  step.value = 3
}

function scanSN(val) {
  scan.value.sn = val
  snInfo.value.currentMo = 'MO202401'
  snInfo.value.model = 'MODEL-A'
  snInfo.value.currentGroup = 'AOI'
  addLog(`Scan SN: ${val}`)
  alertSuccess('SN OK → scan MO mới')
  step.value = 4
}

function scanMO(val) {
  scan.value.newMo = val
  addLog(`Scan MO mới: ${val}`)
  alertSuccess('Sẵn sàng REWORK')
  step.value = 5
}

function doRework() {
  addLog(`REWORK SN ${scan.value.sn} → MO ${scan.value.newMo}`)
  alertSuccess('REWORK OK')
  resetAll()
}

/* ===== RESCAN ===== */
function rescanSelected() {
  const target = Number(rescanStep.value)
  clearFromStep(target)
  step.value = target
  rescanStep.value = ''
  alertInfo(`Scan lại ${stepName(target)}`)
  focusScan()
}

function clearFromStep(s) {
  if (s <= 1) {
    station.value = { locationCode: '', line: '', group: '' }
    employee.value = { cardNo: '', fullName: '', department: '' }
    scan.value = { sn: '', newMo: '' }
    snInfo.value = { currentMo: '', model: '', currentGroup: '' }
  }
  if (s <= 2) {
    employee.value = { cardNo: '', fullName: '', department: '' }
    scan.value = { sn: '', newMo: '' }
    snInfo.value = { currentMo: '', model: '', currentGroup: '' }
  }
  if (s <= 3) {
    scan.value.sn = ''
    snInfo.value = { currentMo: '', model: '', currentGroup: '' }
  }
  if (s <= 4) {
    scan.value.newMo = ''
  }
}

function stepName(s) {
  return ['LOCATION', 'EMP', 'SN', 'MO', 'REWORK'][s - 1]
}

function resetAll() {
  step.value = 1
  station.value = { locationCode: '', line: '', group: '' }
  employee.value = { cardNo: '', fullName: '', department: '' }
  scan.value = { sn: '', newMo: '' }
  snInfo.value = { currentMo: '', model: '', currentGroup: '' }
  alertInfo('Vui lòng scan LOCATION')
}

/* ===== INIT ===== */
onMounted(() => focusScan())
</script>

<style scoped>
.input {
  width: 100%;
  height: 36px;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 14px;
}
.label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
</style>
