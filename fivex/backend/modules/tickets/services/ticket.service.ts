import { AppError } from '../../../shared/errors/AppError.js'
import { ticketRepository } from '../repositories/ticket.repository.js'
import type { CreateTicketInput } from '../validations/ticket.validation.js'

export const ticketService = {
  async createTicket(input: CreateTicketInput, userId?: string) {
    return ticketRepository.create({ ...input, userId })
  },

  async listAll() {
    return ticketRepository.findAll()
  },

  async toggleStatus(id: string) {
    const ticket = await ticketRepository.findById(id)
    if (!ticket) {
      throw new AppError('Ticket not found.', 404)
    }
    const nextStatus = ticket.status === 'open' ? 'resolved' : 'open'
    await ticketRepository.setStatus(id, nextStatus)
  },
}
