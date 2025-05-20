// components/Messages.jsx
import React from 'react';

const Messages = ({ messages, username }) => {
  return (
    <div className="flex-1 overflow-y-auto border rounded bg-gray-50 p-4">
      {messages.length > 0 ? (
        <ul className="space-y-4">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={`p-3 rounded ${
                msg.username === 'System'
                  ? 'bg-gray-200 italic'
                  : msg.username === username
                  ? 'bg-blue-100 text-right'
                  : 'bg-gray-100'
              }`}
            >
              {msg.username !== 'System' && (
                <p className="font-bold text-sm">{msg.username}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-sm">{msg.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 italic">
          Aucun message pour le moment.
        </p>
      )}
    </div>
  );
};

export default Messages;
