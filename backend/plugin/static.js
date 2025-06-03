import fp from 'fastify-plugin'
import path from 'path'
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async (fastify) => {

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/',
  })

  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.method === 'GET' && !req.raw.url.startsWith('/api')) {
      return reply.sendFile('index.html')
    }
    reply.status(404).send({ error: 'ページが見つかりません' })
  })
})
