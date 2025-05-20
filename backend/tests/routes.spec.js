const request = require('supertest');
const { server } = require('../server'); // Importez le serveur depuis server.js

describe('GET /', () => {
  let serverInstance;

  // Démarrez le serveur avant les tests
  beforeAll((done) => {
    serverInstance = server.listen(5000, done); // Démarre le serveur pour les tests
  });

  // Arrêtez le serveur après les tests
  afterAll((done) => {
    serverInstance.close(done); // Ferme le serveur après les tests
  });

  it('should return "Backend is running" with status 200', async () => {
    const response = await request(server).get('/');  // Utilisez `server` pour faire la requête
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Backend is running');
  });
});