import { apiClient } from '@/api/client'

export type TicketStatus = 'open' | 'resolved'

export interface Ticket {
  id: string
  subject: string
  message: string
  submittedByName: string
  submittedByEmail: string
  status: TicketStatus
  createdAt: string
}

export interface SubmitTicketInput {
  subject: string
  message: string
  submittedByName: string
  submittedByEmail: string
}

export const ticketsApi = {
  // Public (optionally authenticated): anyone can submit a support ticket.
  submit: async (input: SubmitTicketInput): Promise<Ticket> => {
    const { data } = await apiClient.post<{ ticket: Ticket }>('/api/tickets', input)
    return data.ticket
  },

  // Admin-only: the support inbox.
  listAll: async (): Promise<Ticket[]> => {
    const { data } = await apiClient.get<{ tickets: Ticket[] }>('/api/tickets')
    return data.tickets
  },

  toggleStatus: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/tickets/${id}/toggle`)
  },
}
