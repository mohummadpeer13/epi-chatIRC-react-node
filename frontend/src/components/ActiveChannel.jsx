import React from 'react';

const ActiveChannel = ({ activeChannel, onLeaveChannel }) => {
  return (
    <div className="mb-6 p-4 bg-gray-100 rounded border flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        Channel actif : {activeChannel || 'Aucun channel sélectionné'}
      </h2>
      {activeChannel && (
        <button
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onLeaveChannel}
        >
          Quitter le channel
        </button>
      )}
    </div>
  );
};

export default ActiveChannel;