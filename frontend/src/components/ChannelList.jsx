// ChannelList.jsx
import React from 'react';

const ChannelList = ({ channels, activeChannel, setActiveChannel }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {channels
        .filter((channel) => channel && channel.id) // Vérifie que chaque canal est valide
        .map((channel) => (
          <button
            key={channel.id}
            className={`px-4 py-2 rounded ${
              activeChannel === channel.id
                ? 'bg-blue-500 text-white'
                : channel.id.startsWith('private:')
                ? 'bg-green-200 text-black hover:bg-green-300'
                : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
            }`}
            onClick={() => setActiveChannel(channel.id)}
          >
            {typeof channel.alias === 'string' ? channel.alias : channel.id}
          </button>
        ))}
    </div>
  );
};

export default ChannelList;
