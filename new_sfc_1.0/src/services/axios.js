import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_PRODUCTION,
    timeout: 10000,
});

const TEMP_TOKEN = `eyJ0eXAiOiJhdCtqd3QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjUwM2Q4NzQyYWMzOWQ1Y2UwOTY2NjEwMGVkYzA2OTQwIn0.eyJpc3MiOiJodHRwczovL2lkcC5sb2NhbCIsImF1ZCI6ImFwaTEiLCJzdWIiOiI1YmU4NjM1OTA3M2M0MzRiYWQyZGEzOTMyMjIyZGFiZSIsImNsaWVudF9pZCI6Ik1lZ2FDTkMiLCJlbXBfbm8iOiJJVCBKV1QiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NjUxODU4NDUsImlhdCI6MTc2NTE4MjI0NSwianRpIjoiNWVjNTlhYTU4OGRmMzMwZGJlNzc5YTBlZTVhY2RjNjUifQ.Cx8fMr23mGFx_KuGiYAS0lc_ESsz_DqkRI5odxgyQkCTF_RrgLjCUqWZTTFMTBfkgqt3pq669NI69kHYrXAV6A`;

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${TEMP_TOKEN}`;
    return config;
});

export default api;
