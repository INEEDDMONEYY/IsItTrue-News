import type { Request, Response } from 'express'
import { asyncHandler } from '../../../utils/asyncHandler.js'
import { ticketService } from '../services/ticket.service.js'
import type { CreateTicketInput } from '../validations/ticket.validation.js'

export const ticketController = {
  // Public (optionally authenticated): anyone can submit a support ticket.
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateTicketInput
    const ticket = await ticketService.createTicket(input, req.user?.id)
    res.status(201).json({ message: 'Ticket submitted successfully.', ticket })
  }),

  // Admin-only: every ticket, for the support inbox.
  listAll: asyncHandler(async (_req: Request, res: Response) => {
    const tickets = await ticketService.listAll()
    res.status(200).json({ tickets })
  }),

  toggleStatus: asyncHandler(async (req: Request, res: Response) => {
    await ticketService.toggleStatus(req.params.id)
    res.status(200).json({ message: 'Ticket updated successfully.' })
  }),
}
