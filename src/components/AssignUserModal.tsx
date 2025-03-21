import React from 'react';
import { X } from 'lucide-react';
import type { User } from '../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AssignUserModalProps {
  users: User[];
  synagogueId: string;
  onClose: () => void;
}

export default function AssignUserModal({ users, synagogueId, onClose }: AssignUserModalProps) {
  async function assignSynagogueToUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentSynagogueIds = userDoc.data()?.synagogueIds || [];
      
      if (!currentSynagogueIds.includes(synagogueId)) {
        await updateDoc(userRef, {
          synagogueIds: [...currentSynagogueIds, synagogueId]
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error assigning synagogue:', error);
    }
  }

  const availableUsers = users.filter(user => 
    !user.synagogueIds?.includes(synagogueId)
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">הוסף משתמש לבית הכנסת</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-2 overflow-y-auto flex-1">
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    תפקיד: {' '}
                    {user.role === 'gabbai' && 'גבאי'}
                    {user.role === 'security' && 'קב״ט'}
                    {user.role === 'technician' && 'טכנאי'}
                    {user.role === 'admin' && 'מנהל'}
                  </p>
                </div>
                <button
                  onClick={() => assignSynagogueToUser(user.id)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  הוסף
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">אין משתמשים זמינים לשיוך</p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          סגור
        </button>
      </div>
    </div>
  );
}