<template>
    <!-- ================= BỘ LỌC ================= -->
    <div class="bg-white rounded-2xl p-6 shadow-sm">

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-4">

            <!-- Serial -->
            <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-gray-600">Serial sản phẩm</span>
                <input
                    v-model="keyword"
                    type="text"
                    placeholder="Nhập Serial"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <!-- Mã thiết bị -->
            <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-gray-600">Mã thiết bị</span>
                <input
                    type="text"
                    placeholder="Nhập mã máy"
                    class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <!-- Thời gian tạo -->
            <div class="flex items-center gap-4 relative">
                <span class="w-24 text-sm text-gray-600">Thời gian tạo</span>

                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    range-separator="-"
                    placement="bottom-start"
                    :teleported="false"
                    popper-class="datepicker-fix"
                    class="flex-1"
                />
            </div>
        </div>

        <!-- ================= MỞ RỘNG ================= -->
        <div v-show="expanded" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

            <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-gray-600">Trạng thái</span>
                <select class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm">
                    <option value="">Tất cả</option>
                    <option>Hoàn thành</option>
                    <option>Đang chạy</option>
                    <option>Lỗi</option>
                </select>
            </div>

            <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-gray-600">Loại công đơn</span>
                <select class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm">
                    <option value="">Tất cả</option>
                    <option>Sản xuất</option>
                    <option>Kiểm tra</option>
                    <option>Sửa chữa</option>
                </select>
            </div>

            <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-gray-600">Dòng sản phẩm</span>
                <select class="flex-1 h-9 rounded-full bg-gray-100 px-4 text-sm">
                    <option value="">Tất cả</option>
                    <option>Mega CNC</option>
                    <option>Mini CNC</option>
                </select>
            </div>
        </div>

        <!-- ================= ACTION ================= -->
        <div class="flex justify-end gap-4 mt-6">

            <button
                @click="expanded = !expanded"
                class="text-blue-500 mr-auto text-sm flex items-center gap-1">
                {{ expanded ? 'Thu gọn' : 'Mở rộng' }}
                <span :class="{ 'rotate-180': expanded }">▼</span>
            </button>

            <button
                @click="applyFilter"
                class="h-9 px-8 rounded-full bg-blue-500 text-white text-sm">
                Tìm kiếm
            </button>

            <button
                @click="resetFilter"
                class="h-9 px-8 rounded-full border border-blue-500 text-blue-500 text-sm">
                Xóa lọc
            </button>

            <button
                @click="deleteSelected"
                class="h-9 px-8 rounded-full bg-red-500 text-white text-sm">
                Xóa đã chọn
            </button>
        </div>
    </div>

    <!-- ================= BẢNG ================= -->
    <div class="mt-6 overflow-hidden rounded-xl border bg-white">
        <div class="overflow-x-auto">

            <table class="min-w-full table-auto">

                <thead class="bg-gray-50">
                    <tr>
                        <th v-for="col in columns" :key="col"
                            class="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                            {{ columnMap[col] || col }}
                        </th>

                        <!-- Checkbox bên phải -->
                        <th class="px-4 py-3 text-center w-16">
                            <input
                                type="checkbox"
                                v-model="selectAll"
                                @change="toggleSelectAll"
                            />
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y">
                    <tr
                        v-for="row in pagedData"
                        :key="row.SN"
                        class="hover:bg-gray-50">

                        <td v-for="col in columns" :key="col"
                            class="px-5 py-3 text-sm text-gray-700">
                            {{ row[col] }}
                        </td>

                        <td class="px-4 py-3 text-center">
                            <input
                                type="checkbox"
                                v-model="selectedRows"
                                :value="row.SN"
                            />
                        </td>
                    </tr>
                </tbody>

            </table>
        </div>

        <!-- ================= PHÂN TRANG ================= -->
        <div class="flex items-center justify-between px-4 py-3 border-t">

            <p class="text-sm text-gray-600">
                Hiển thị
                <b>{{ startItem }}</b> –
                <b>{{ endItem }}</b>
                / <b>{{ totalItems }}</b> bản ghi
            </p>

            <div class="space-x-1">
                <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">
                    Trước
                </button>

                <button
                    v-for="page in totalPages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                        'px-3 py-1 rounded',
                        page === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                    ]">
                    {{ page }}
                </button>

                <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">
                    Sau
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

/* ================= BIẾN ================= */
const keyword = ref("");
const dateRange = ref([]);
const expanded = ref(false);

const users = ref([]);
const columns = ref([]);

const selectedRows = ref([]);
const selectAll = ref(false);

const currentPage = ref(1);
const pageSize = ref(2);

/* ================= MAP CỘT ================= */
const columnMap = {
    SN: "Serial sản phẩm",
    MachineCode: "Mã máy",
    Status: "Trạng thái",
    Type: "Loại công đơn",
    ProductLine: "Dòng sản phẩm",
    CreateTime: "Thời gian tạo"
};

/* ================= FAKE DATA ================= */
const fetchData = () => {
    users.value = [
        { SN: "SN001", MachineCode: "CNC-01", Status: "Hoàn thành", Type: "Sản xuất", ProductLine: "Mega CNC", CreateTime: "2025-12-15" },
        { SN: "SN002", MachineCode: "CNC-02", Status: "Đang chạy", Type: "Kiểm tra", ProductLine: "Mega CNC", CreateTime: "2025-12-15" },
        { SN: "SN003", MachineCode: "CNC-03", Status: "Lỗi", Type: "Sửa chữa", ProductLine: "Mini CNC", CreateTime: "2025-12-16" }
    ];

    columns.value = Object.keys(users.value[0]);
    selectedRows.value = [];
    selectAll.value = false;
};

/* ================= PHÂN TRANG ================= */
const totalItems = computed(() => users.value.length);
const totalPages = computed(() =>
    Math.ceil(totalItems.value / pageSize.value)
);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return users.value.slice(start, start + pageSize.value);
});

const startItem = computed(() =>
    totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
);

const endItem = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalItems.value)
);

/* ================= CHECKBOX ================= */
const toggleSelectAll = () => {
    selectAll.value
        ? selectedRows.value = pagedData.value.map(r => r.SN)
        : selectedRows.value = [];
};

watch(selectedRows, () => {
    selectAll.value =
        pagedData.value.length > 0 &&
        selectedRows.value.length === pagedData.value.length;
});

/* ================= ACTION ================= */
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        selectedRows.value = [];
        selectAll.value = false;
    }
};

const applyFilter = () => fetchData();

const resetFilter = () => {
    keyword.value = "";
    dateRange.value = [];
    fetchData();
};

const deleteSelected = () => {
    if (!selectedRows.value.length) {
        alert("Chưa chọn dữ liệu để xóa");
        return;
    }

    users.value = users.value.filter(
        r => !selectedRows.value.includes(r.SN)
    );

    selectedRows.value = [];
    selectAll.value = false;
};

onMounted(fetchData);
</script>

<style scoped>
:deep(.datepicker-fix) {
    z-index: 3000 !important;
}
</style>
