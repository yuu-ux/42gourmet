// plugins/static.js
import fp from 'fastify-plugin'
import path from 'path'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'

export default fp(async (fastify) => {
  await fastify.register(fastifyCors)

  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
  })

  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.method === 'GET' && !req.raw.url.startsWith('/api')) {
      return reply.sendFile('public/index.html')
    }
    reply.status(404).send({ error: 'ページが見つかりません' })
  })
})
