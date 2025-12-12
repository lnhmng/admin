<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white dark:bg-white/[0.03]">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">CNC Tables</h2>

        <div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 items-stretch w-full sm:w-auto">

            <div class="relative w-full sm:w-80 flex-shrink-0">
                <input type="text" placeholder="Tìm kiếm" v-model="keyword"
                    class="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
                <svg class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div class="w-full sm:w-auto flex-grow"> 
                <el-date-picker v-model="dateRange" type="datetimerange" unlink-panels range-separator="-"
                    start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss" class="w-full !w-full" />
            </div>

            <div class="flex space-x-3 flex-shrink-0 w-full sm:w-auto justify-end">
                <button @click="applyFilter" class="px-6 py-2 rounded-lg text-white bg-blue-400 hover:bg-blue-500 transition shadow whitespace-nowrap">
                    搜索
                </button>
                <button @click="resetFilter" class="px-6 py-2 rounded-lg text-blue-500 bg-white border border-blue-500 hover:bg-blue-50 transition-shadow shadow whitespace-nowrap">
                    清空
                </button>
                <button @click="exportData" class="px-6 py-2 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition shadow whitespace-nowrap">
                    Xuất dữ liệu
                </button>
            </div>

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