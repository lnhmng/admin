<template>
  <!-- SEARCH -->
  <div class="search-card">
    <div class="search-row">
      <div class="flex items-center gap-4">
        <span class="w-7 text-sm text-gray-600">SN</span>

        <input v-model="serialNumber" type="text" placeholder="请输入SN" class="flex-1 min-w-[400px] max-w-[600px] h-9
         rounded-full bg-gray-100 px-4 text-sm
         focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div class="search-actions">
        <button @click="applyFilter" class="btn-search">搜索</button>
        <button @click="resetFilter" class="btn-clear">清空</button>
        <button @click="exportData" class="btn-export">
          Export
        </button>
      </div>
    </div>
  </div>

  <div v-if="errorMessage" class="mt-4 text-center text-red-500">
    {{ errorMessage }}
  </div>

  <!-- SN INFO -->
<div v-if="snInfo" class="sn-info">
  <!-- INPUT FILTER -->
  <div class="mb-6 grid grid-cols-3 gap-6">
    <!-- 产品SN -->
    <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">产品SN</span>
      <input
        v-model="serialNumber"
        type="text"
        placeholder="产品SN"
        class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>

    <!-- 设备编码 -->
    <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">设备编码</span>
      <input
        v-model="machineCode"
        type="text"
        placeholder="设备编码"
        class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>

    <!-- 创建时间 -->
    <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">创建时间</span>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
        range-separator="-"
        class="flex-1"
        :teleported="false"
      />
    </div>

        <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">设备编码</span>
      <input
        v-model="machineCode"
        type="text"
        placeholder="设备编码"
        class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>

        <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">设备编码</span>
      <input
        v-model="machineCode"
        type="text"
        placeholder="设备编码"
        class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>

        <div class="flex items-center gap-4">
      <span class="w-24 text-sm text-gray-600">设备编码</span>
      <input
        v-model="machineCode"
        type="text"
        placeholder="设备编码"
        class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
               focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  </div>
  
</div>
  <!-- TABLE -->
  <div class="table-card">
    <div class="overflow-x-auto">
      <table class="min-w-full table-auto">
        <thead>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </thead>

        <tbody>
          <tr v-for="(row, index) in users" :key="`${row.SERIAL_NUMBER}-${index}`">
            <td v-for="col in columns" :key="col">
              {{ isDate(row[col]) ? formatDate(row[col]) : row[col] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalItems > 0" class="pagination">
      <p>
        <b>{{ (currentPage - 1) * pageSize + 1 }}</b> –
        <b>{{ Math.min(currentPage * pageSize, totalItems) }}</b>
        / <b>{{ totalItems }}</b>
      </p>

      <div class="page-btns">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
          上一页
        </button>

        <button v-for="p in visiblePages" :key="p" @click="changePage(p)" :class="{ active: p === currentPage }">
          {{ p }}
        </button>

        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue"
import api from "@/services/axios"

const users = ref([])
const columns = ref([])
const errorMessage = ref("")

const serialNumber = ref("")
const machineCode = ref("")
const stationName = ref("")
const result = ref("")
const dateRange = ref([])

const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)

const selectedRows = ref([])

const snInfo = ref({
  SERIAL_NUMBER: "VN0VCV6TFCV00594000YA03",
  MO_NUMBER: "000100052398",
  MODEL_NAME: "VCV6T-A03",
  VERSION: "A03",
  LINE_NAME: "A01-3F-T08",
  CURRENT_STATION: "SHIPPING",
  NEXT_STATION: "END",
  STATUS: "good",
  ROUTE: "DELL_PERC11_VCV6T",
  CREATE_TIME: "2025-08-27 16:59:04",
  LAST_SCAN_TIME: "2025-09-20 09:04:22",
  LAST_OPERATOR: "epdvi_sync"
})


const maxVisiblePages = 5

const visiblePages = computed(() => {
  if (totalPages.value <= maxVisiblePages) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  const half = Math.floor(maxVisiblePages / 2)
  let start = currentPage.value - half
  let end = currentPage.value + half

  if (start < 1) {
    start = 1
    end = maxVisiblePages
  }

  if (end > totalPages.value) {
    end = totalPages.value
    start = totalPages.value - maxVisiblePages + 1
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const formatDate = v => v ? v.replace("T", " ").slice(0, 19) : ""
const isDate = v => typeof v === "string" && v.includes("T")

const buildParams = (extra = {}) => {
  const params = { ...extra }
  if (serialNumber.value) params.serialNumber = serialNumber.value
  if (machineCode.value) params.machineCode = machineCode.value
  if (stationName.value) params.stationName = stationName.value
  if (result.value) params.result = result.value
  if (dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  return params
}

const fetchData = async () => {
  errorMessage.value = ""
  try {
    const res = await api.get("/MegaCNC", {
      params: buildParams({
        page: currentPage.value,
        pageSize: pageSize.value
      })
    })

    const resp = res.data
    if (!resp.success) {
      users.value = []
      columns.value = []
      totalItems.value = 0
      totalPages.value = 0
      errorMessage.value = resp.message || "API Error"
      return
    }

    users.value = resp.data || []
    totalItems.value = resp.paging?.totalItems || 0
    totalPages.value = resp.paging?.totalPages || 0
    columns.value = users.value.length ? Object.keys(users.value[0]) : []
    selectedRows.value = []
  } catch {
    errorMessage.value = "Không thể kết nối server"
  }
}

const applyFilter = () => {
  currentPage.value = 1
  fetchData()
}

const resetFilter = () => {
  serialNumber.value = ""
  machineCode.value = ""
  stationName.value = ""
  result.value = ""
  dateRange.value = []
  currentPage.value = 1
  fetchData()
}

const changePage = p => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    fetchData()
  }
}

const exportData = async () => {
  let list = []

  if (selectedRows.value.length > 0) {
    list = users.value.filter((_, index) =>
      selectedRows.value.includes(`${users.value[index].SERIAL_NUMBER}-${index}`)
    )
  } else {
    const res = await api.get("/MegaCNC", {
      params: buildParams({
        page: 1,
        pageSize: totalItems.value || 999999
      })
    })

    const resp = res.data
    if (!resp.success) return

    list = resp.data || []
  }

  if (!list.length) return

  const headers = Object.keys(list[0])
  const rows = list.map(row =>
    headers
      .map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`)
      .join(",")
  )

  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "MegaCNC.csv"
  link.click()
}

onMounted(fetchData)
</script>

<style>
/* ===== SEARCH ===== */
.search-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px;
  border: 1px solid #e5e7eb;
}

.search-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-label {
  font-size: 14px;
  color: #333;
}

.search-input {
  width: 360px;
  height: 36px;
  border-radius: 999px;
  border: 2px solid #111;
  padding: 0 16px;
  font-size: 14px;
  outline: none;
}

.search-actions {
  display: flex;
  gap: 16px;
}

.btn-search {
  height: 36px;
  padding: 0 28px;
  border-radius: 999px;
  background: #2f78ff;
  color: #fff;
  border: none;
  font-size: 14px;
}

.btn-clear {
  height: 36px;
  padding: 0 28px;
  border-radius: 999px;
  background: #fff;
  color: #2f78ff;
  border: 1px solid #2f78ff;
  font-size: 14px;
}

.btn-export {
  height: 36px;
  padding: 0 28px;
  border-radius: 999px;
  background: #2f78ff;
  color: #fff;
  border: none;
  font-size: 14px;
}

/* ===== SN INFO ===== */
.sn-info {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 24px;
  font-size: 13px;
}

.info-grid label {
  color: #666;
  margin-right: 6px;
}

.info-grid span {
  color: #1f2937;
}

.good {
  color: #16a34a;
}

/* ===== TABLE ===== */
.table-card {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

table thead th {
  background: #eef3f7;
  padding: 12px 16px;
  font-size: 13px;
  color: #374151;
  text-align: left;
}

table tbody td {
  padding: 12px 16px;
  font-size: 13px;
}

table tbody tr:hover {
  background: #f8fafc;
}

/* ===== PAGINATION ===== */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
}

.page-btns button {
  margin: 0 2px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f3f4f6;
}

.page-btns .active {
  background: #2f78ff;
  color: #fff;
}
</style>