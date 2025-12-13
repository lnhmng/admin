<template>
    <!-- <div class="bg-white rounded-2xl p-6 shadow-sm">

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">产品SN</span>
                <input type="text" placeholder="产品SN" class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">设备编码</span>
                <input type="text" placeholder="设备编码" class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">创建时间</span>
                <el-date-picker type="daterange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间"
                    class="flex-1" />
            </div>
        </div>

        <div v-show="expanded" class="grid grid-cols-3 gap-6 mt-4"></div>

        <div class="flex justify-end gap-4 mt-6">
            <button class="h-9 px-8 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600">
                搜索
            </button>
            <button class="h-9 px-8 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50">
                清空
            </button>
            <button @click="exportData"
                class="h-9 px-8 rounded-full border bg-green-400 text-white text-sm hover:bg-blue-50">
                Export
            </button>
        </div>
    </div> -->

    <div class="bg-white rounded-2xl p-6 shadow-sm">

        <!-- ===== BASIC FILTER (luôn hiển thị) ===== -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">产品SN</span>
                <input
                    type="text"
                    placeholder="产品SN"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">设备编码</span>
                <input
                    type="text"
                    placeholder="设备编码"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">创建时间</span>
                <el-date-picker
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    class="flex-1"
                />
            </div>
        </div>

        <!-- ===== EXPANDED FILTER (可展开区域) ===== -->
        <!--
        expanded = true  → 显示
        expanded = false → 隐藏
        -->
        <div v-show="expanded" class="grid grid-cols-3 gap-6 mt-4">

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">工单状态</span>
                <select
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">请选择</option>
                </select>
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">工单类型</span>
                <select
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">请选择</option>
                </select>
            </div>

            <div class="flex items-center gap-4">
                <span class="w-20 text-sm text-gray-600">产品系列</span>
                <select
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">请选择</option>
                </select>
            </div>
        </div>

        <!-- ===== ACTIONS ===== -->
        <div class="flex justify-end gap-4 mt-6">

            <!-- 展开 / 收起 -->
            <button
                @click="expanded = !expanded"
                class="text-sm text-blue-500 mr-auto flex items-center gap-1">
                {{ expanded ? '收起' : '展开' }}
                <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': expanded }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <button class="h-9 px-8 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600">
                搜索
            </button>

            <button class="h-9 px-8 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50">
                清空
            </button>

            <button
                @click="exportData"
                class="h-9 px-8 rounded-full bg-green-400 text-white text-sm hover:bg-green-500">
                Export
            </button>
        </div>
    </div>


    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">

            <table class="min-w-full table-auto">

                <thead v-if="columns.length" class="bg-gray-50 dark:bg-gray-800/50">
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                        <th v-for="(col, index) in columns" :key="index"
                            class="px-5 py-3 text-left sm:px-6 whitespace-nowrap">
                            <p class="font-semibold text-gray-600 text-sm dark:text-gray-300 !whitespace-nowrap">
                                {{ col }}
                            </p>
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(row, rowIndex) in users" :key="rowIndex"
                        class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800 transition duration-100">
                        <td v-for="(col, colIndex) in columns" :key="colIndex"
                            class="px-5 py-4 sm:px-6 text-sm text-gray-700 dark:text-gray-300">
                            {{ row[col] }}
                        </td>
                    </tr>
                </tbody>

            </table>

        </div>

        <div v-if="totalPages > 1 || totalItems > 0"
            class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-900/50">
            <div class="flex-1 flex justify-start">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span class="font-semibold">{{ (currentPage - 1) * pageSize + 1 }}</span> to
                    <span class="font-semibold">{{ Math.min(currentPage * pageSize, totalItems) }}</span> of
                    <span class="font-semibold">{{ totalItems }}</span> entries
                </p>
            </div>

            <div>
                <nav class="inline-flex space-x-1 rounded-md shadow-sm" aria-label="Pagination">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                        class="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition duration-150">
                        Previous
                    </button>

                    <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="[
                        'relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition duration-150',
                        page === currentPage
                            ? 'bg-teal-500 text-white font-bold'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    ]">
                        {{ page }}
                    </button>

                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition duration-150">
                        Next
                    </button>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const users = ref([]);
const columns = ref([]);

const keyword = ref("");
const dateRange = ref([]);

const currentPage = ref(1);
const pageSize = ref(20);
const totalItems = ref(100);
const totalPages = ref(5);

const fetchData = async () => {
    try {
        const url = `https://localhost:44361/api/MegaCNC?page=${currentPage.value}&pageSize=${pageSize.value}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwM2Q4NzQyYWMzOWQ1Y2UwOTY2NjEwMGVkYzA2OTQwIn0.eyJpc3MiOiJodHRwczovL2lkcC5sb2NhbCIsImF1ZCI6ImFwaTEiLCJzdWIiOiI1YmU4NjM1OTA3M2M0MzRiYWQyZGEzOTMyMjIyZGFiZSIsImNsaWVudF9pZCI6Ik1lZ2FDTkMiLCJlbXBfbm8iOiJJVCBKV1QiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NjUxODU4NDUsImlhdCI6MTc2NTE4MjI0NSwianRpIjoiNWVjNTlhYTU4OGRmMzMwZGJlNzc5YTBlZTVhY2RjNjUifQ.Cx8fMr23mGFx_KuGiYAS0lc_ESsz_DqkRI5odxgyQkCTF_RrgLjCUqWZTTFMTBfkgqt3pq669NI69kHYrXAV6A`
            }
        });

        let data = response.data.data || response.data;

        if (Array.isArray(data) && data.length > 0) {
            users.value = data;

            if (columns.value.length === 0) {
                columns.value = Object.keys(data[0]);
            }
        } else {
            users.value = [];
        }

    } catch (err) {
        console.error("API ERROR:", err);
    }
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        currentPage.value = page;
        fetchData();
    }
};

const expanded = ref(false);

const applyFilter = () => {
    currentPage.value = 1;
    fetchData();
};

const resetFilter = () => {
    keyword.value = "";
    dateRange.value = [];
    fetchData();
};

const exportData = () => {
    alert("Đang xuất dữ liệu...");
    console.log("Xuất dữ liệu...");
};


onMounted(() => {
    totalPages.value = Math.ceil(totalItems.value / pageSize.value);
    fetchData();
});
</script>