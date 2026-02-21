<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
const currentPageTitle = ref('')
import { ref, onMounted } from 'vue'
onMounted(() => {})
</script>
