import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Synagogue } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface EditSynagogueModalProps {
  synagogue: Synagogue;
  onClose: () => void;
}

export default function EditSynagogueModal({ synagogue, onClose }: EditSynagogueModalProps) {
  const [editedSynagogue, setEditedSynagogue] = useState({
    name: synagogue.name,
    phone: synagogue.phone,
    address: synagogue.address,
    city: synagogue.city,
    titleRight: synagogue.titleRight,
    titleLeft: synagogue.titleLeft,
    titleRightBottom: synagogue.titleRightBottom,
    titleLeftBottom: synagogue.titleLeftBottom,
    contentRightBottom: synagogue.contentRightBottom || '',
    contentLeftBottom: synagogue.contentLeftBottom || '',
    candleLightingOffset: synagogue.candleLightingOffset || 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const synagogueRef = doc(db, 'synagogues', synagogue.id);
      await updateDoc(synagogueRef, {
        name: editedSynagogue.name,
        phone: editedSynagogue.phone,
        address: editedSynagogue.address,
        city: editedSynagogue.city,
        titleRight: editedSynagogue.titleRight,
        titleLeft: editedSynagogue.titleLeft,
        titleRightBottom: editedSynagogue.titleRightBottom,
        titleLeftBottom: editedSynagogue.titleLeftBottom,
        contentRightBottom: editedSynagogue.contentRightBottom,
        contentLeftBottom: editedSynagogue.contentLeftBottom,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error updating synagogue:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">עריכת כותרות ומלל</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כותרת 1 ימין למעלה</label>
              <input
                type="text"
                value={editedSynagogue.titleRight}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, titleRight: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="הזן כותרת..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כותרת 2 שמאל למעלה</label>
              <input
                type="text"
                value={editedSynagogue.titleLeft}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, titleLeft: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="הזן כותרת..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כותרת 3 ימין למטה</label>
              <input
                type="text"
                value={editedSynagogue.titleRightBottom}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, titleRightBottom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="הזן כותרת..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כותרת 4 שמאל למטה</label>
              <input
                type="text"
                value={editedSynagogue.titleLeftBottom}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, titleLeftBottom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                placeholder="הזן כותרת..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תוכן תחתון ימני</label>
              <textarea
                value={editedSynagogue.contentRightBottom}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, contentRightBottom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                rows={4}
                placeholder="הזן תוכן..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תוכן תחתון שמאלי</label>
              <textarea
                value={editedSynagogue.contentLeftBottom}
                onChange={(e) => setEditedSynagogue({ ...editedSynagogue, contentLeftBottom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                rows={4}
                placeholder="הזן תוכן..."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">זמן הדלקת נרות לפני שקיעה (בדקות)</label>
            <input
              type="number"
              min="18"
              max="40"
              value={editedSynagogue.candleLightingOffset}
              onChange={(e) => setEditedSynagogue({ ...editedSynagogue, candleLightingOffset: parseInt(e.target.value) })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-start gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              שמור שינויים
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}