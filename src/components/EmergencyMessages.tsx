import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { EmergencyMessage } from '../types';
import { getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { israelCities } from '../data/israelCities';

export default function EmergencyMessages() {
  const [messages, setMessages] = useState<EmergencyMessage[]>([]);
  const [newMessage, setNewMessage] = useState({ city: '', content: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userCity, setUserCity] = useState<string>('');
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const fetchUserCity = async () => {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserCity(userDoc.data().city || '');
          if (userDoc.data().city) {
            setNewMessage(prev => ({ ...prev, city: userDoc.data().city }));
          }
        }
      };
      fetchUserCity();
    }
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, 'emergencyMessages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: EmergencyMessage[] = [];
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() } as EmergencyMessage);
      });
      setMessages(messageData);
    });
    return unsubscribe;
  }, []);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'emergencyMessages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.city || !newMessage.content) return;

    try {
      await addDoc(collection(db, 'emergencyMessages'), {
        ...newMessage,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.uid
      });
      setNewMessage({ city: '', content: '' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="flex-1 flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 ml-2" />
          <h2 className="text-xl font-bold text-gray-900">הודעות חירום</h2>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          {isFormOpen ? (
            <>
              <ChevronUp className="h-5 w-5 ml-2" />
              סגור טופס
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5 ml-2" />
              פתח טופס הודעה
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עיר</label>
              <select
                disabled={userRole === 'security'}
                value={newMessage.city}
                onChange={(e) => setNewMessage({ ...newMessage, city: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                required
              >
                {userRole === 'security' ? (
                  <option value={userCity}>{userCity}</option>
                ) : (
                  <>
                    <option value="">בחר עיר</option>
                    {israelCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תוכן ההודעה</label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              שלח הודעת חירום
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">הודעות פעילות</h3>
        {messages.map((message) => (
          <div key={message.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {message.city}
                </span>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="מחק הודעה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleString('he-IL')}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}