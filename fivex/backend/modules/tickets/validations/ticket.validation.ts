import { z } from 'zod'

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().trim().min(1, 'Message is required').max(3000, 'Message is too long'),
  submittedByName: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name is too long'),
  submittedByEmail: z.string().trim().email('Enter a valid email address'),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
