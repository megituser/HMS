import { useQuery, useMutation, useQueryClient }
  from '@tanstack/react-query'
import * as api from '../api/billingAPI'
import toast from 'react-hot-toast'

export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: api.getAllInvoices
  })

export const useInvoice = (id: number) =>
  useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoiceById(id),
    enabled: !!id
  })

export const useCreateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created')
    }
  })
}

export const useAddInvoiceItem = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number,
      data: { description: string, amount: number }
    }) => api.addInvoiceItem(id, data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoice', variables.id] })
      toast.success('Item added')
    }
  })
}

export const useRecordPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: number,
      data: { amount: number, method: string }
    }) => api.recordPayment(id, data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoice', variables.id] })
      toast.success('Payment recorded')
    }
  })
}

export const useDownloadPdf = () =>
  useMutation({
    mutationFn: async (id: number) => {
      const response = await api.downloadInvoicePdf(id)
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  })
