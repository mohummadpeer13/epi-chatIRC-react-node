const initializeChannels = require('../socket/initializeChannels'); 
const Channel = require('../models/Channel');


jest.mock('../models/Channel');

describe('initializeChannels', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait créer le channel "management" si il n\'existe pas', async () => {
    
    Channel.findOne.mockResolvedValue(null);

    const saveMock = jest.fn();
    Channel.prototype.save = saveMock;

    await initializeChannels();

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(); 
  });

  it('ne devrait pas créer le channel "management" si il existe déjà', async () => {

    Channel.findOne.mockResolvedValue({ name: 'management' });

    const saveMock = jest.fn();
    Channel.prototype.save = saveMock;

    await initializeChannels();

    expect(saveMock).toHaveBeenCalledTimes(0);
  });

  it('devrait gérer les erreurs correctement', async () => {
    Channel.findOne.mockRejectedValue(new Error('Database error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await initializeChannels(); 

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing channels:', expect.any(Error));

    consoleErrorSpy.mockRestore(); 
  });
});

