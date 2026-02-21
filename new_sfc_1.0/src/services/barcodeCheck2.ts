import axios from 'axios'

const BASE_URL = 'http://10.81.171.15:8184/api/rework'

export const checkEmp = (empNo: string) =>
  axios.post(`${BASE_URL}/check-emp`, { empNo })

export const scanSN = (sn: string) =>
  axios.post(`${BASE_URL}/scan-sn`, { sn })

export const checkReworkMo = (mo: string) =>
  axios.post(`${BASE_URL}/check-rework-mo`, { mo })

export const reworkSN = (payload: {
  location: string
  sn: string
  mo: string
  empNo: string
}) => axios.post(`${BASE_URL}/mo-rework`, payload)
