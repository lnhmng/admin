<template>
  <div class="p-4 bg-gray-50 min-h-screen">

    <div class="mb-3 flex items-center gap-2 px-4 py-2 rounded" :class="alert.type">
      <span class="text-lg">⚠</span>

      <span v-if="!alert.hasFail">
        {{ alert.message }}
      </span>

      <span v-else>
        {{ alert.prefix }}
        <span class="underline cursor-pointer text-red-600" title="Click để tải danh sách SN không thành công"
          @click="alert.isReworkFail ? downloadFailedReworkSN() : downloadFailedSN()">
          {{ alert.failText }}
        </span>
      </span>
    </div>

    <!-- WRAPPER DANH SÁCH LỖI -->
    <div class="error-panel-wrapper">
      <!-- Import Errors -->
      <div v-if="Object.keys(failedSNGroups).length" class="mt-3 bg-white p-4 rounded-lg shadow border border-red-100">

        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold text-red-600 text-sm flex items-center gap-2">
            ❌ Lỗi Import SN
          </div>
        </div>

        <div v-for="(sns, msg) in failedSNGroups" :key="msg"
          class="flex justify-between items-center px-3 py-2 rounded hover:bg-red-50 transition">
          <div class="flex items-center gap-2">
            <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
              {{ sns.length }} SN
            </span>
            <span class="text-sm text-gray-700 font-medium">{{ msg }}</span>
          </div>

          <button
            class="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            @click="downloadOneErrorFile(msg, sns, 'import')">
            ⬇ Download
          </button>
        </div>
      </div>

      <!-- Rework Errors -->
      <div v-if="Object.keys(failedReworkGroups).length"
        class="mt-3 bg-white p-4 rounded-lg shadow border border-purple-100">

        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold text-purple-600 text-sm flex items-center gap-2">
            ❌ Lỗi Rework SN
          </div>
        </div>

        <div v-for="(sns, msg) in failedReworkGroups" :key="msg"
          class="flex justify-between items-center px-3 py-2 rounded hover:bg-purple-50 transition">
          <div class="flex items-center gap-2">
            <span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {{ sns.length }} SN
            </span>
            <span class="text-sm text-gray-700 font-medium">{{ msg }}</span>
          </div>

          <button
            class="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            @click="downloadOneErrorFile(msg, sns, 'rework')">
            Download
          </button>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <input ref="scanInput" v-model="scanValue" @keyup.enter="handleScan" :placeholder="currentPlaceholder" class="w-full h-10 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>

    <div class="flex bg-white rounded shadow min-h-[560px]">

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

      <div class="flex-1 p-4">

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">LINE_NAME</label>
            <input v-model="station.locationCode" readonly class="input" />
          </div>

          <div>
            <label class="label">SN</label>
            <div class="flex gap-2">
              <input v-model="scan.sn" readonly class="input flex-1" />

              <input ref="txtInput" type="file" accept=".txt" class="hidden" @change="importTxtSN" />
              <button v-if="step === 3" @click="$refs.txtInput.click()"
                class="px-4 rounded bg-blue-500 text-white text-sm">
                Import TXT
              </button>
            </div>
          </div>

          <div>
            <label class="label">MO REWORK</label>
            <input v-model="scan.newMo" readonly class="input" />
          </div>
        </div>

        <div class="mt-4 flex gap-3 items-center">

          <button :disabled="step !== 5 || importedSNs.length === 0" @click="doRework"
            class="px-6 py-2 rounded text-white bg-blue-500 disabled:bg-gray-300">
            REWORK
          </button>

          <select v-model="rescanStep" class="h-9 rounded bg-gray-100 px-2 text-sm">
            <option disabled value="">RESCAN</option>
            <option v-for="s in stepOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>

          <button :disabled="!rescanStep" @click="rescanSelected"
            class="px-4 py-2 rounded bg-yellow-500 text-white disabled:bg-gray-300">
            Xác nhận
          </button>
        </div>

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

const BASE_URL = 'http://10.81.171.15:8184/api/rework'
// const BASE_URL = 'https://localhost:44361/rework'

const step = ref(1)
const scanValue = ref('')
const scanInput = ref(null)
const txtInput = ref(null)
const rescanStep = ref('')
const failedSNs = ref([])
const failedReworkSNs = ref([])

const failedSNGroups = ref({})        
const failedReworkGroups = ref({})   


const station = ref({ locationCode: '' })
const employee = ref({ cardNo: '', fullName: '', department: '' })
const scan = ref({ sn: '', newMo: '' })
const snInfo = ref({ currentMo: '' })
const logs = ref([])

const alert = ref({
  type: 'bg-orange-50 text-orange-600',
  message: 'Scan Line Name',
  hasFail: false,
  prefix: '',
  failText: ''
})

const importedSNs = ref([])

const stepOptions = computed(() => [
  { value: 1, label: 'LOCATION' },
  { value: 2, label: 'EMP' },
  { value: 3, label: 'SN' },
  { value: 4, label: 'MO' }
].filter(s => s.value < step.value))

const currentPlaceholder = computed(() => {
  switch (step.value) {
    case 1: return 'Scan Line Name'
    case 2: return 'Scan EMP_NO'
    case 3: return 'Scan SN or import .txt'
    case 4: return 'Scan MO Reworks'
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
  alert.value = {
    type: 'bg-orange-50 text-orange-600',
    message: msg,
    hasFail: false
  }
}

function alertSuccess(msg) {
  alert.value = {
    type: 'bg-green-50 text-green-600',
    message: msg,
    hasFail: false
  }
}

function alertImportResult(success, fail) {
  if (fail === 0) {
    alert.value = {
      type: 'bg-green-50 text-green-600',
      message: `Import hoàn tất: ${success} SN thành công`,
      hasFail: false
    }
    return
  }

  alert.value = {
    type: success > 0
      ? 'bg-green-50 text-green-600'
      : 'bg-orange-50 text-orange-600',
    hasFail: true,
    prefix: `Import hoàn tất: ${success} SN thành công, `,
    failText: `${fail} SN không thành công`
  }
}

function downloadFailedSN() {
  const groups = failedSNGroups.value
  if (!Object.keys(groups).length) return

  let content = ''
  Object.entries(groups).forEach(([msg, sns]) => {
    content += `===== ERROR: ${msg} =====\n`
    content += sns.join('\n') + '\n\n'
  })

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'SN_IMPORT_FAIL_BY_ERROR.txt'
  a.click()

  URL.revokeObjectURL(url)
}

function focusScan() {
  setTimeout(() => scanInput.value?.focus(), 50)
}

function handleScan() {
  const val = scanValue.value.trim()
  if (!val) return

  if (step.value === 1) scanLocation(val)
  else if (step.value === 2) scanEmp(val)
  else if (step.value === 3) scanSN(val)
  else if (step.value === 4) scanMO(val)

  scanValue.value = ''
}

function scanLocation(val) {
  resetAll()
  failedSNGroups.value = {}
  failedReworkGroups.value = {}
  station.value.locationCode = val
  addLog(`Scan LINE_NAME: ${val}`)
  alertSuccess('LINE_NAME OK → scan EMP')
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
    alertSuccess('EMP OK → scan SN')
    step.value = 3
  } catch {
    alertInfo('Server Error')
  }
}

async function scanSN(val) {
  addLog(`Scan SN: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/scan-sn`, { sn: val })
    if (!res.data.success) {
      addLog(`❌ SN ${val}: ${res.data.message}`)
      alertInfo(res.data.message)
      return
    }
    scan.value.sn = val
    if (!importedSNs.value.includes(val))
      importedSNs.value.push(val)

    addLog(`✅ SN ${val} OK`)
    alertSuccess('SN OK → scan MO Rework')
    step.value = 4
  } catch {
    alertInfo('Server Error')
  }
}

async function scanMO(val) {
  addLog(`Scan MO: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/check-rework-mo`, { mo: val })
    if (!res.data.success) {
      addLog(`❌ MO ${val}: ${res.data.message}`)
      alertInfo(res.data.message)
      return
    }
    scan.value.newMo = val
    addLog(`✅ MO ${val} OK`)
    alertSuccess('REWORK')
    step.value = 5
  } catch {
    alertInfo('Server Error')
  }
}

async function importTxtSN(e) {
  if (step.value !== 3) return

  importedSNs.value = []
  failedSNs.value = []
  scan.value.sn = ''

  let success = 0
  let fail = 0

  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (ev) => {
    const sns = [...new Set(
      ev.target.result.split(/\r?\n/).map(x => x.trim()).filter(Boolean)
    )]

    addLog(`📥 IMPORT TXT: ${sns.length} SN`)

    for (const sn of sns) {
      try {
        const res = await axios.post(`${BASE_URL}/scan-sn`, { sn })
        if (res.data.success) {
          success++
          importedSNs.value.push(sn)
        } else {
          fail++
          failedSNs.value.push(sn)

          const msg = res.data.message || 'UNKNOWN_ERROR'
          if (!failedSNGroups.value[msg]) failedSNGroups.value[msg] = []
          failedSNGroups.value[msg].push(sn)

          addLog(`❌ IMPORT NG: SN ${sn}: ${msg}`)
        }
      } catch {
        fail++
        failedSNs.value.push(sn)

        const msg = 'SERVER_ERROR'
        if (!failedSNGroups.value[msg]) failedSNGroups.value[msg] = []
        failedSNGroups.value[msg].push(sn)

        addLog(`❌ IMPORT NG: SN ${sn}: Server Error`)
      }
    }

    if (success > 0) step.value = 4
    alertImportResult(success, fail)
  }

  reader.readAsText(file)
  e.target.value = ''
}

async function doRework() {
  if (importedSNs.value.length === 0) {
    alertInfo('Không có SN hợp lệ để REWORK')
    return
  }

  let success = 0
  let fail = 0
  // failedReworkSNs.value = []
  failedReworkGroups.value = {}

  for (const sn of importedSNs.value) {
    try {
      const res = await axios.post(`${BASE_URL}/mo-rework`, {
        location: station.value.locationCode,
        sn,
        mo: scan.value.newMo,
        empNo: employee.value.cardNo
      })

      if (res.data.success) {
        success++
        addLog(`✅ REWORK OK: SN ${sn}`)
      } else {
        fail++
        failedReworkSNs.value.push(sn)
        const msg = res.data.message || 'UNKNOWN_ERROR'
        if (!failedReworkGroups.value[msg]) failedReworkGroups.value[msg] = []
        failedReworkGroups.value[msg].push(sn)
        addLog(`❌ REWORK NG: SN ${sn}: ${msg}`)
      }
    } catch {
      fail++
      failedReworkSNs.value.push(sn)
      const msg = 'SERVER_ERROR'
      if (!failedReworkGroups.value[msg]) failedReworkGroups.value[msg] = []
      failedReworkGroups.value[msg].push(sn)
      addLog(`❌ REWORK NG: SN ${sn}: Server Error`)
    }
  }

  if (fail === 0) {
    alertSuccess(`REWORK hoàn tất: ${success} SN thành công`)
  } else {
    alert.value = {
      type: success > 0
        ? 'bg-green-50 text-green-600'
        : 'bg-orange-50 text-orange-600',
      hasFail: true,
      prefix: `REWORK hoàn tất: ${success} SN thành công, `,
      failText: `${fail} SN không thành công`,
      isReworkFail: true
    }
  }

  setTimeout(() => {
    resetAll()
  }, 10000)
}

function downloadFailedReworkSN() {
  const groups = failedReworkGroups.value
  if (!Object.keys(groups).length) return

  let content = ''
  Object.entries(groups).forEach(([msg, sns]) => {
    content += `===== ERROR: ${msg} =====\n`
    content += sns.join('\n') + '\n\n'
  })

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'SN_REWORK_FAIL_BY_ERROR.txt'
  a.click()

  URL.revokeObjectURL(url)
}

function downloadOneErrorFile(msg, sns, type) {
  const safeMsg = msg.replace(/[^a-zA-Z0-9_-]/g, '_')
  const blob = new Blob([sns.join('\n')], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download =
    type === 'rework'
      ? `SN_REWORK_FAIL_${safeMsg}.txt`
      : `SN_IMPORT_FAIL_${safeMsg}.txt`

  a.click()
  URL.revokeObjectURL(url)
}

function rescanSelected() {
  const target = Number(rescanStep.value)
  clearFromStep(target)
  step.value = target
  rescanStep.value = ''
  alertInfo(`Rescan ${stepName(target)}`)
  focusScan()
}

function clearFromStep(s) {
  if (s <= 3) {
    scan.value.sn = ''
    importedSNs.value = []
    failedSNs.value = []
  }
  if (s <= 4) {
    scan.value.newMo = ''
  }
}

function stepName(s) {
  return ['LOCATION', 'EMP', 'SN', 'MO'][s - 1]
}

function resetAll() {
  step.value = 1
  station.value = { locationCode: '' }
  employee.value = { cardNo: '', fullName: '', department: '' }
  scan.value = { sn: '', newMo: '' }
  snInfo.value = { currentMo: '' }
  importedSNs.value = []
  failedSNs.value = []
  failedReworkSNs.value = []
}

onMounted(() => focusScan())

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

/* Tách block lỗi khỏi input scan */
.error-panel-wrapper {
  margin-bottom: 20px;
  /* tạo khoảng cách với input bên dưới */
}

/* Style chung cho panel lỗi */
.error-panel {
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Nhẹ nhàng hơn cho Import */
.error-panel.import {
  border: 1px solid #fee2e2;
}

/* Nhẹ nhàng hơn cho Rework */
.error-panel.rework {
  border: 1px solid #ede9fe;
}
</style>
