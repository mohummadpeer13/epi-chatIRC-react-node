import React from 'react';

const InputMessage = ({ messageInput, setMessageInput, handleSendMessage }) => {
  return (
    <div className="mt-4 flex">
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }}
        placeholder="Écrivez un message ou /create <channel_name> pour créer un channel..."
        className="flex-1 p-2 border rounded focus:outline-none"
      />
      <button
        onClick={handleSendMessage}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Envoyer
      </button>
    </div>
  );
};

export default InputMessage;
