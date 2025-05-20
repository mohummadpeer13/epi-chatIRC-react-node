const mongoose = require('mongoose');
const connectDatabase = require('../db/db'); // Chemin vers votre fichier db.js

jest.mock('mongoose'); // Mock de la bibliothèque mongoose

describe('connectDatabase', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {}); // Mock process.exit
  });

  afterEach(() => {
    jest.clearAllMocks(); // Nettoyage des mocks après chaque test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValueOnce(); // Simuler une connexion réussie

    await connectDatabase(); // Attendre la promesse

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MongoDB Atlas');
  });

  it('should handle connection errors', async () => {
    const errorMessage = 'Connection failed';
    mongoose.connect.mockRejectedValueOnce(new Error(errorMessage)); // Simuler une erreur

    await connectDatabase(); // Attendre la promesse

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error connecting to MongoDB Atlas:',
      errorMessage
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});