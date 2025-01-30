import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { RegisterUseCase } from '@/use-cases/register'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { name, email, password } = registerBodySchema.parse(request.body)

  const usersRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(usersRepository)

  try {
    await registerUseCase.execute({ email, name, password })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
}
