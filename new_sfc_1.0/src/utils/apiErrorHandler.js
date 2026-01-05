export function handleApiError(res) {
  if (res.success) return null

  switch (res.code) {
    case 'NO_DATA':
      return { type: 'warning', message: res.message }

    case 'INVALID_PAGING':
    case 'INVALID_MODEL':
      return { type: 'error', message: res.message }

    case 'INVALID_TOKEN':
      return { type: 'error', message: '登录已过期，请重新登录' }

    case 'SERVER_ERROR':
      return { type: 'error', message: '系统错误，请联系 IT' }

    default:
      return { type: 'error', message: res.message || '未知错误' }
  }
}
