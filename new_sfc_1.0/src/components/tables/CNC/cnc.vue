<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm">

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">产品SN</span>
                <input
                    v-model="serialNumber"
                    type="text"
                    placeholder="产品SN"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">设备编码</span>
                <input
                    v-model="machineCode"
                    type="text"
                    placeholder="设备编码"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">创建时间</span>
                <el-date-picker
                    v-model="dateRange"
                    type="datetimerange"
                    unlink-panels
                    range-separator="-"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    class="w-full !w-full" />
            </div>
        </div>

        <div class="flex justify-end gap-4 mt-6">
            <button @click="applyFilter"
                class="h-9 px-8 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600">
                搜索
            </button>
            <button @click="resetFilter"
                class="h-9 px-8 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50">
                清空
            </button>
            <button @click="exportData"
                class="h-9 px-8 rounded-full border bg-green-400 text-white text-sm hover:bg-blue-50">
                Export
            </button>
        </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="max-w-full overflow-x-auto">

            <table class="min-w-full table-auto">
                <thead v-if="columns.length" class="bg-gray-50">
                    <tr>
                        <th v-for="(col, index) in columns" :key="index"
                            class="px-5 py-3 text-left whitespace-nowrap">
                            {{ col }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(row, rowIndex) in users" :key="rowIndex"
                        class="hover:bg-gray-50">
                        <td v-for="(col, colIndex) in columns" :key="colIndex"
                            class="px-5 py-3 text-sm">
                            {{ row[col] }}
                        </td>
                    </tr>
                </tbody>
            </table>

        </div>

        <div v-if="totalItems > 0"
            class="flex items-center justify-between border-t px-4 py-3">
            <p class="text-sm">
                Showing {{ (currentPage - 1) * pageSize + 1 }}
                to {{ Math.min(currentPage * pageSize, totalItems) }}
                of {{ totalItems }}
            </p>

            <div class="flex gap-2">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                    Previous
                </button>

                <button v-for="page in totalPages" :key="page"
                    @click="changePage(page)"
                    :class="page === currentPage ? 'font-bold text-blue-500' : ''">
                    {{ page }}
                </button>

                <button @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages">
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/axios";

const users = ref([]);
const columns = ref([]);

const serialNumber = ref("");
const machineCode = ref("");
const dateRange = ref([]);

const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(0);
const totalPages = ref(0);

const fetchData = async () => {
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value
        };

        if (serialNumber.value?.trim()) {
            params.serialNumber = serialNumber.value.trim();
        }

        if (machineCode.value?.trim()) {
            params.machineCode = machineCode.value.trim();
        }

        if (dateRange.value?.length === 2) {
            params.startDate = dateRange.value[0];
            params.endDate = dateRange.value[1];
        }

        const { data } = await api.get("/api/MegaCNC", { params });

        users.value = data?.data || [];
        totalItems.value = data?.paging?.totalItems || 0;
        totalPages.value = data?.paging?.totalPages || 0;

        columns.value = users.value.length
            ? Object.keys(users.value[0])
            : [];

    } catch (err) {
        console.error("API ERROR:", err);
    }
};

const applyFilter = () => {
    currentPage.value = 1;
    fetchData();
};

const resetFilter = () => {
    serialNumber.value = "";
    machineCode.value = "";
    dateRange.value = [];
    currentPage.value = 1;
    fetchData();
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchData();
    }
};

const exportData = () => {
    if (!users.value || users.value.length === 0) {
        alert("没有可导出的数据");
        return;
    }

    const headers = columns.value;
    const csvRows = [];

    csvRows.push(headers.join(","));

    users.value.forEach(row => {
        const values = headers.map(col => {
            let value = row[col];

            if (value === null || value === undefined) return "";

            value = value.toString().replace(/"/g, '""');

            if (value.search(/("|,|\n)/g) >= 0) {
                value = `"${value}"`;
            }

            return value;
        });

        csvRows.push(values.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `MegaCNC_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
};

onMounted(fetchData);
</script>


