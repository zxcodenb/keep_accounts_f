import api from './index'

export const accountApi = {
  // 添加新记录
  addRecord(data) {
    return api.post('/account_records', data)
  },

  // 获取记录列表
  getRecords(params) {
    return api.get('/account_records/list', { params })
  },

  // 更新记录
  updateRecord(id, data) {
    return api.put(`/account_records/${id}`, data)
  },

  // 删除记录
  deleteRecord(id) {
    return api.delete(`/account_records/${id}`)
  }
}
