import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function fetchSummary() { const { data } = await api.get('/ratings/summary'); return data }
export async function fetchRatings(params) { const { data } = await api.get('/ratings', { params }); return data }


