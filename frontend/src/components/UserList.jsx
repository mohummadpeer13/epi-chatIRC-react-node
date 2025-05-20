import React from 'react';

const UserList = ({ users, onUserClick }) => {
  return (
    <div className="mb-4 border-b border-gray-300 pb-4">
      <h2 className="text-lg font-semibold">Utilisateurs connectés</h2>
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="cursor-pointer text-gray-700 hover:bg-blue-200 p-2"
            onClick={() => onUserClick(user.username)}>
              {user.username}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Aucun utilisateur connecté.</p>
      )}
    </div>
  );
};

export default UserList;