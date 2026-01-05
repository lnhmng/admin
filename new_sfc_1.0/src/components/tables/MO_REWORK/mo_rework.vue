<template>
  <div class="p-4 bg-gray-50 min-h-screen">

    <div class="mb-3 flex items-center gap-2 px-4 py-2 rounded"
         :class="alert.type">
      <span class="text-lg">⚠</span>
      <span>{{ alert.message }}</span>
    </div>

    <div class="mb-4">
      <input
        ref="scanInput"
        v-model="scanValue"
        @keyup.enter="handleScan"
        :placeholder="currentPlaceholder"
        class="w-full h-10 rounded-full bg-gray-100 px-4 text-sm
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

      <div class="flex-1 p-4">

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">LOCATION</label>
            <input v-model="station.locationCode" readonly class="input" />
          </div>

          <div>
            <label class="label">SN</label>
            <div class="flex gap-2">
              <input v-model="scan.sn" readonly class="input flex-1" />

              <input
                ref="txtInput"
                type="file"
                accept=".txt"
                class="hidden"
                @change="importTxtSN"
              />
              <button
                v-if="step === 3"
                @click="$refs.txtInput.click()"
                class="px-4 rounded bg-blue-500 text-white text-sm">
                Import TXT
              </button>
            </div>
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

        <div class="mt-4 flex gap-3 items-center">

          <button
            :disabled="step !== 5 || importedSNs.length === 0"
            @click="doRework"
            class="px-6 py-2 rounded text-white bg-blue-500 disabled:bg-gray-300">
            REWORK
          </button>

          <select
            v-model="rescanStep"
            class="h-9 rounded bg-gray-100 px-2 text-sm">
            <option disabled value="">Scan lại bước</option>
            <option
              v-for="s in stepOptions"
              :key="s.value"
              :value="s.value">
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://localhost:44361/api/rework'

const step = ref(1)
const scanValue = ref('')
const scanInput = ref(null)
const txtInput = ref(null)
const rescanStep = ref('')

const station = ref({ locationCode: '' })
const employee = ref({ cardNo: '', fullName: '', department: '' })
const scan = ref({ sn: '', newMo: '' })
const snInfo = ref({ currentMo: '' })
const logs = ref([])
const alert = ref({ type: 'bg-orange-50 text-orange-600', message: 'Vui lòng scan LOCATION' })
const importedSNs = ref([])

const stepOptions = computed(() => [
  { value: 1, label: 'LOCATION' },
  { value: 2, label: 'EMP' },
  { value: 3, label: 'SN' },
  { value: 4, label: 'MO' }
].filter(s => s.value < step.value))

const currentPlaceholder = computed(() => {
  switch (step.value) {
    case 1: return 'Scan LOCATION'
    case 2: return 'Scan EMP'
    case 3: return 'Scan SN hoặc import TXT'
    case 4: return 'Scan MO mới'
    default: return ''
  }
})

function addLog(text) { logs.value.unshift({ time: new Date().toLocaleString(), action: text }) }
function alertInfo(msg) { alert.value = { type: 'bg-orange-50 text-orange-600', message: msg } }
function alertSuccess(msg) { alert.value = { type: 'bg-green-50 text-green-600', message: msg } }
function focusScan() { setTimeout(() => scanInput.value?.focus(), 50) }

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

function scanLocation(val) { station.value.locationCode = val; addLog(`Scan LOCATION: ${val}`); alertSuccess('LOCATION OK → scan EMP'); step.value = 2 }
async function scanEmp(val) {
  addLog(`Scan EMP: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/check-emp`, { empNo: val })
    if (!res.data.success) { addLog(`❌ EMP ${val}: ${res.data.message}`); alertInfo(res.data.message); return }
    employee.value = { cardNo: val, fullName: res.data.fullName || '', department: res.data.department || '' }
    addLog(`✅ EMP ${val} hợp lệ`)
    alertSuccess('EMP OK → scan SN')
    step.value = 3
  } catch { alertInfo('Lỗi kết nối server') }
}

async function scanSN(val) {
  addLog(`Scan SN: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/scan-sn`, { sn: val })
    if (!res.data.success) { addLog(`❌ SN ${val}: ${res.data.message}`); alertInfo(`SN ${val}: ${res.data.message}`); return }
    scan.value.sn = val
    if (!importedSNs.value.includes(val)) importedSNs.value.push(val)
    addLog(`✅ SN ${val} OK`)
    alertSuccess('SN OK → scan MO mới')
    step.value = 4
  } catch { alertInfo(`SN ${val}: Lỗi kết nối server`) }
}

async function scanMO(val) {
  addLog(`Scan MO: ${val}`)
  try {
    const res = await axios.post(`${BASE_URL}/check-rework-mo`, { mo: val })
    if (!res.data.success) { addLog(`❌ MO ${val}: ${res.data.message}`); alertInfo(res.data.message); return }
    scan.value.newMo = val
    addLog(`✅ MO ${val} hợp lệ`)
    alertSuccess('Sẵn sàng REWORK')
    step.value = 5
  } catch { alertInfo('Lỗi kết nối server') }
}

async function doRework() {
  if (importedSNs.value.length === 0) { alertInfo('Không có SN hợp lệ để REWORK'); return }
  for (const sn of importedSNs.value) {
    addLog(`🔁 REWORK SN ${sn} → MO ${scan.value.newMo}`)
    try {
      const res = await axios.post(`${BASE_URL}/mo-rework`, {
        location: station.value.locationCode,
        sn,
        mo: scan.value.newMo,
        empNo: employee.value.cardNo
      })
      if (!res.data.success) addLog(`❌ REWORK NG: SN ${sn}: ${res.data.message}`)
      else addLog(`✅ REWORK OK: SN ${sn}`)
    } catch { addLog(`❌ REWORK NG: SN ${sn}: Lỗi server`) }
  }
  importedSNs.value = []
  resetAll()
}

function rescanSelected() {
  const target = Number(rescanStep.value)
  clearFromStep(target)
  step.value = target
  rescanStep.value = ''
  alertInfo(`Scan lại ${stepName(target)}`)
  focusScan()
}

function clearFromStep(s) {
  if (s <= 1) { station.value = { locationCode: '' }; employee.value = { cardNo: '', fullName: '', department: '' }; scan.value = { sn: '', newMo: '' }; snInfo.value = { currentMo: '' }; importedSNs.value = [] }
  if (s <= 2) { employee.value = { cardNo: '', fullName: '', department: '' }; scan.value = { sn: '', newMo: '' }; snInfo.value = { currentMo: '' }; importedSNs.value = [] }
  if (s <= 3) { scan.value.sn = ''; snInfo.value = { currentMo: '' } }
  if (s <= 4) { scan.value.newMo = '' }
}

function stepName(s) { return ['LOCATION', 'EMP', 'SN', 'MO'][s - 1] }

async function importTxtSN(e) {
  if (step.value !== 3) { alertInfo('Chỉ được import ở bước scan SN'); return }
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    const sns = [...new Set(ev.target.result.split(/\r?\n/).map(x => x.trim()).filter(Boolean))]
    addLog(`📥 Import TXT: ${sns.length} SN`)
    for (const sn of sns) {
      addLog(`⏳ Xử lý SN: ${sn}`)
      try {
        const res = await axios.post(`${BASE_URL}/scan-sn`, { sn })
        if (res.data.success) { addLog(`✅ SN ${sn} OK`); if (!importedSNs.value.includes(sn)) importedSNs.value.push(sn) }
        else addLog(`❌ SN ${sn} NG: ${res.data.message}`)
      } catch { addLog(`❌ SN ${sn} NG: Lỗi server`) }
    }
    step.value = 4
    alertSuccess('SN OK → scan MO mới')
  }
  reader.readAsText(file)
  e.target.value = ''
}

function resetAll() {
  step.value = 1
  station.value = { locationCode: '' }
  employee.value = { cardNo: '', fullName: '', department: '' }
  scan.value = { sn: '', newMo: '' }
  snInfo.value = { currentMo: '' }
  importedSNs.value = []
  alertInfo('Vui lòng scan LOCATION')
}

onMounted(() => focusScan())
</script>

<style scoped>
.input { width: 100%; height: 36px; background: #f3f4f6; border-radius: 6px; padding: 0 10px; font-size: 14px }
.label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px }
</style>
