import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import storeRoutes from './routes/store.route.js';
import { connectDB } from './db/mysql.js';
import staticPlugin from './plugin/static.js';

const app = Fastify({
    logger: true,
});
await app.register(cors, {
    origin: true,
    credentials: true,
});
app.register(staticPlugin);
app.register(fastifySwagger, {
    openapi: {
        info: {
            title: '42Gourmet API',
            description: 'レストラン情報 API',
            version: '1.0.0',
        },
        tags: [{ name: 'Stores', description: 'レストラン関連エンドポイント' }],
    },
});

app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
});

app.register(storeRoutes, { prefix: '/api' });

app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.code(500).send({ error: 'サーバーエラーが発生しました' });
});


(async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || '0.0.0.0';

        await app.listen({ port: PORT, host: HOST });
        console.log(`サーバーが起動しました: http://${HOST}:${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
})();

export default app;
