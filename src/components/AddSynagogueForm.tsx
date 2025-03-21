import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../types';
import { israelCities } from '../data/israelCities';

interface AddSynagogueFormProps {
  users: User[];
  userRole: string;
  onClose: () => void;
}

export default function AddSynagogueForm({ users, userRole, onClose }: AddSynagogueFormProps) {
  const [newSynagogue, setNewSynagogue] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    titleRight: '',
    titleLeft: '',
    titleRightBottom: '',
    titleLeftBottom: '',
    contentRightBottom: '',
    contentLeftBottom: '',
    candleLightingOffset: 30,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const synagogueRef = await addDoc(collection(db, 'synagogues'), {
        ...newSynagogue,
        lastConnection: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error adding synagogue:', error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">שם בית הכנסת</label>
          <input
            type="text"
            value={newSynagogue.name}
            onChange={(e) => setNewSynagogue({ ...newSynagogue, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">טלפון</label>
          <input
            type="tel"
            value={newSynagogue.phone}
            onChange={(e) => setNewSynagogue({ ...newSynagogue, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">כתובת</label>
          <input
            type="text"
            value={newSynagogue.address}
            onChange={(e) => setNewSynagogue({ ...newSynagogue, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">עיר</label>
          <select
            value={newSynagogue.city}
            onChange={(e) => setNewSynagogue({ ...newSynagogue, city: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            required
          >
            <option value="">בחר עיר</option>
            {israelCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">זמן הדלקת נרות לפני שקיעה (בדקות)</label>
          <input
            type="number"
            min="18"
            max="40"
            value={newSynagogue.candleLightingOffset}
            onChange={(e) => setNewSynagogue({ ...newSynagogue, candleLightingOffset: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          הוסף בית כנסת
        </button>
      </form>
    </div>
  );
}