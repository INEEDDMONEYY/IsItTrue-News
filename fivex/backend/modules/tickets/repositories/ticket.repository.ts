import { Ticket, type TicketStatus } from '../models/Ticket.js'

export const ticketRepository = {
  create(data: {
    subject: string
    message: string
    submittedByName: string
    submittedByEmail: string
    userId?: string
  }) {
    return Ticket.create(data)
  },

  findAll() {
    return Ticket.find().sort({ createdAt: -1 })
  },

  findById(id: string) {
    return Ticket.findById(id)
  },

  setStatus(id: string, status: TicketStatus) {
    return Ticket.findByIdAndUpdate(id, { status }, { new: true })
  },
}
