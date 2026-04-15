import api from '../lib/axios'

export const getAllInvoices = () =>
  api.get('/invoices')

export const getInvoiceById = (id: number) =>
  api.get(`/invoices/${id}`)

export const getInvoicesByPatient = (patientId: number) =>
  api.get(`/invoices/patient/${patientId}`)

export const createInvoice = (patientId: number) =>
  api.post('/invoices', { patientId })

export const addInvoiceItem = (id: number, data: {
  description: string, amount: number
}) => api.post(`/invoices/${id}/items`, data)

export const recordPayment = (id: number, data: {
  amount: number, method: string
}) => api.post(`/invoices/${id}/payments`, data)

export const downloadInvoicePdf = (id: number) =>
  api.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
