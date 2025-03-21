import React, { useState } from "react";
import { X } from "lucide-react";
import type { Synagogue } from "../types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { israelCities } from "../data/israelCities";

interface EditSynagogueDetailsModalProps {
  synagogue: Synagogue;
  onClose: () => void;
}

export default function EditSynagogueDetailsModal({
  synagogue,
  onClose,
}: EditSynagogueDetailsModalProps) {
  const [editedSynagogue, setEditedSynagogue] = useState({
    name: synagogue.name,
    phone: synagogue.phone,
    address: synagogue.address,
    city: synagogue.city,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const synagogueRef = doc(db, "synagogues", synagogue.id);
      await updateDoc(synagogueRef, {
        name: editedSynagogue.name,
        phone: editedSynagogue.phone,
        address: editedSynagogue.address,
        city: editedSynagogue.city,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating synagogue details:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            עריכת פרטי בית הכנסת
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם בית הכנסת
            </label>
            <input
              type="text"
              value={editedSynagogue.name}
              onChange={(e) =>
                setEditedSynagogue({ ...editedSynagogue, name: e.target.value })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              טלפון
            </label>
            <input
              type="tel"
              value={editedSynagogue.phone}
              onChange={(e) =>
                setEditedSynagogue({
                  ...editedSynagogue,
                  phone: e.target.value,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כתובת
            </label>
            <input
              type="text"
              value={editedSynagogue.address}
              onChange={(e) =>
                setEditedSynagogue({
                  ...editedSynagogue,
                  address: e.target.value,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              עיר
            </label>
            <select
              value={editedSynagogue.city}
              onChange={(e) =>
                setEditedSynagogue({ ...editedSynagogue, city: e.target.value })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              required
            >
              <option value="">בחר עיר</option>
              {israelCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
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
