import { getStores, getStoreById, addStore } from '../services/store.service.js';
import { getStoresSchema, getStoreByIdSchema, createStoreSchema } from '../schemas/store.schema.js';

export default async function (fastify) {
  fastify.get('/stores', {
    schema: getStoresSchema,
    handler: async (request) => {
      const stores = await getStores(request.query);
      return stores;
    }
  });

  fastify.get('/stores/:id', {
    schema: getStoreByIdSchema,
    handler: async (request) => {
      const store = await getStoreById(request.params.id);
      return store;
    }
  });

  fastify.post('/stores', {
    schema: createStoreSchema,
    handler: async (request) => {
      const newStore = await addStore(request.body);
      return newStore;
    }
  });
}
