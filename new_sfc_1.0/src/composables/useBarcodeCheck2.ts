// import { ref, computed } from 'vue'
// import * as api from '@/services/barcodeCheck2'

// export function useBarcodeCheck2() {
//   const step = ref(1)
//   const scanValue = ref('')

//   const station = ref({ locationCode: '' })
//   const employee = ref({ cardNo: '', fullName: '', department: '' })
//   const scan = ref({ sn: '', newMo: '' })

//   const importedSNs = ref<string[]>([])
//   const logs = ref<{ time: string; action: string }[]>([])

//   const failedSNGroups = ref<Record<string, string[]>>({})
//   const failedReworkGroups = ref<Record<string, string[]>>({})

//   const currentPlaceholder = computed(() =>
//     ['Scan LINE_NAME', 'Scan EMP_NO', 'Scan SN', 'Scan MO Rework'][step.value - 1] || ''
//   )

//   function addLog(action: string) {
//     logs.value.unshift({
//       time: new Date().toLocaleString(),
//       action
//     })
//   }

//   function resetAll() {
//     step.value = 1
//     scanValue.value = ''
//     station.value = { locationCode: '' }
//     employee.value = { cardNo: '', fullName: '', department: '' }
//     scan.value = { sn: '', newMo: '' }
//     importedSNs.value = []
//     failedSNGroups.value = {}
//     failedReworkGroups.value = {}
//     logs.value = []
//   }

//   async function handleScan() {
//     const val = scanValue.value.trim()
//     if (!val) return

//     if (step.value === 1) {
//       station.value.locationCode = val
//       addLog(`Scan LINE: ${val}`)
//       step.value = 2
//     }

//     else if (step.value === 2) {
//       addLog(`Scan EMP: ${val}`)
//       const res = await api.checkEmp(val)
//       if (!res.data.success) {
//         addLog(`❌ EMP NG: ${res.data.message}`)
//         return
//       }

//       employee.value = {
//         cardNo: val,
//         fullName: res.data.fullName || '',
//         department: res.data.department || ''
//       }

//       addLog(`✅ EMP OK`)
//       step.value = 3
//     }

//     else if (step.value === 3) {
//       addLog(`Scan SN: ${val}`)
//       const res = await api.scanSN(val)

//       if (!res.data.success) {
//         const msg = res.data.message || 'INVALID_SN'
//         if (!failedSNGroups.value[msg]) failedSNGroups.value[msg] = []
//         failedSNGroups.value[msg].push(val)
//         addLog(`❌ SN NG: ${val} → ${msg}`)
//         return
//       }

//       scan.value.sn = val
//       if (!importedSNs.value.includes(val)) importedSNs.value.push(val)

//       addLog(`✅ SN OK: ${val}`)
//       step.value = 4
//     }

//     else if (step.value === 4) {
//       addLog(`Scan MO: ${val}`)
//       const res = await api.checkReworkMo(val)

//       if (!res.data.success) {
//         addLog(`❌ MO NG: ${res.data.message}`)
//         return
//       }

//       scan.value.newMo = val
//       addLog(`✅ MO OK`)
//       step.value = 5
//     }

//     scanValue.value = ''
//   }

//   async function doRework() {
//     failedReworkGroups.value = {}

//     let ok = 0
//     let ng = 0

//     for (const sn of importedSNs.value) {
//       try {
//         const res = await api.reworkSN({
//           location: station.value.locationCode,
//           sn,
//           mo: scan.value.newMo,
//           empNo: employee.value.cardNo
//         })

//         if (res.data.success) {
//           ok++
//           addLog(`✅ REWORK OK: ${sn}`)
//         } else {
//           ng++
//           const msg = res.data.message || 'REWORK_ERROR'
//           if (!failedReworkGroups.value[msg]) failedReworkGroups.value[msg] = []
//           failedReworkGroups.value[msg].push(sn)
//           addLog(`❌ REWORK NG: ${sn} → ${msg}`)
//         }
//       } catch {
//         ng++
//         const msg = 'SERVER_ERROR'
//         if (!failedReworkGroups.value[msg]) failedReworkGroups.value[msg] = []
//         failedReworkGroups.value[msg].push(sn)
//         addLog(`❌ REWORK NG: ${sn} → SERVER_ERROR`)
//       }
//     }

//     addLog(`🎯 REWORK DONE: OK=${ok}, NG=${ng}`)

//     if (ng === 0) {
//       setTimeout(resetAll, 5000)
//     }
//   }

//   return {
//     step,
//     scanValue,
//     currentPlaceholder,
//     station,
//     employee,
//     scan,
//     logs,
//     failedSNGroups,
//     failedReworkGroups,
//     handleScan,
//     doRework
//   }
// }
