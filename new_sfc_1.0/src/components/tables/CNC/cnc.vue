<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">
      <div class="flex items-center gap-4">
        <span class="w-24 text-sm text-gray-600">产品SN</span>
        <input v-model="serialNumber" type="text" placeholder="产品SN"
          class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div class="flex items-center gap-4">
        <span class="w-24 text-sm text-gray-600">设备编码</span>
        <input v-model="machineCode" type="text" placeholder="设备编码"
          class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

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
    </div>

    <div v-show="expanded" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      <div class="flex items-center gap-4">
        <span class="w-24 text-sm text-gray-600">设备站点</span>
        <input v-model="stationName" type="text" placeholder="设备站点"
          class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div class="flex items-center gap-4">
        <span class="w-24 text-sm text-gray-600">结果</span>
        <input v-model="result" type="text" placeholder="结果"
          class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>
    </div>

    <div class="flex justify-end gap-4 mt-6">
      <button @click="expanded = !expanded" class="text-blue-500 mr-auto text-sm">
        {{ expanded ? '收起' : '展开' }}
      </button>

      <button @click="applyFilter" class="h-9 px-8 rounded-full bg-blue-500 text-white text-sm">
        搜索
      </button>

      <button @click="resetFilter" class="h-9 px-8 rounded-full border border-blue-500 text-blue-500 text-sm">
        清空
      </button>

      <button @click="exportData" class="h-9 px-8 rounded-full bg-green-500 text-white text-sm">
        Export
      </button>
    </div>
  </div>

  <div v-if="errorMessage" class="mt-4 text-center text-red-500">
    {{ errorMessage }}
  </div>

  <div class="mt-6 overflow-hidden rounded-xl border bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="col in columns" :key="col"
              class="px-5 py-3 text-left text-sm font-semibold text-gray-600">
              {{ col }}
            </th>
            <th class="px-4 py-3 text-center w-16">
              <input type="checkbox" v-model="selectAll" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr v-for="(row, index) in users" :key="`${row.SERIAL_NUMBER}-${index}`" class="hover:bg-gray-50">
            <td v-for="col in columns" :key="col"
              class="px-5 py-3 text-sm text-gray-700">
              {{ isDate(row[col]) ? formatDate(row[col]) : row[col] }}
            </td>
            <td class="px-4 py-3 text-center">
              <input
                type="checkbox"
                v-model="selectedRows"
                :value="`${row.SERIAL_NUMBER}-${index}`"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalItems > 0" class="flex items-center justify-between px-4 py-3 border-t">
      <p class="text-sm text-gray-600">
        <b>{{ (currentPage - 1) * pageSize + 1 }}</b> –
        <b>{{ Math.min(currentPage * pageSize, totalItems) }}</b>
        / <b>{{ totalItems }}</b>
      </p>

      <div class="space-x-1">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">
          上一页
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          @click="changePage(p)"
          :class="['px-3 py-1 rounded', p === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100']">
          {{ p }}
        </button>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">
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
const expanded = ref(false)

const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)

const selectedRows = ref([])

const selectAll = computed({
  get() {
    return users.value.length > 0 &&
      selectedRows.value.length === users.value.length
  },
  set(val) {
    selectedRows.value = val
      ? users.value.map((r, i) => `${r.SERIAL_NUMBER}-${i}`)
      : []
  }
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
