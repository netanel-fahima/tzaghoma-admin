import React, { useState } from "react";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "../types";
import { israelCities } from "../data/israelCities";

interface AddSynagogueFormProps {
  users: User[];
  userRole: string;
  onClose: () => void;
}

export default function AddSynagogueForm({
  users,
  userRole,
  onClose,
}: AddSynagogueFormProps) {
  const [newSynagogue, setNewSynagogue] = useState({
    name: "",
    phone: "",
    address: "",
    city: "נתיבות",
    titleRight: "זמנים לחול",
    titleLeft: "זמנים לשבת",
    titleRightBottom: "זמני היום",
    titleLeftBottom: "הודעות",
    contentRightBottom: "תוכן תחתון ימני",
    contentLeftBottom: "נא לכבות פלאפונים בשעת התפילה",
    candleLightingOffset: 30,
    backgroundImage:
      "https://tzaghoma.co.il/dashboard/assets/final-back-DmEyM_vm.jpg",
    prayerTimes: [
      {
        id: "4f304c9e-445b-4e48-a265-f97f28b36f25",
        dayType: "חול",
        relativeTime: { relation: "אחרי הזריחה", minutes: 0 },
        description: "שחרית",
        prayerType: "שחרית",
        order: 0,
        fixedTime: "",
        timeType: "relative",
      },
      {
        id: "77a96882-2b2b-40c0-ad49-c1a30ace5346",
        dayType: "חול",
        relativeTime: { relation: "לפני השקיעה", minutes: 25 },
        description: "מנחה",
        prayerType: "מנחה",
        order: 1,
        fixedTime: "14:00",
        timeType: "relative",
      },
      {
        id: "107e856e-850c-4df8-8804-50c591a5d7eb",
        dayType: "חול",
        relativeTime: { relation: "אחרי השקיעה", minutes: 30 },
        description: "ערבית",
        prayerType: "ערבית",
        order: 2,
        fixedTime: "",
        timeType: "relative",
      },
      {
        id: "7e4fadd2-ee80-4da5-ad2f-d0ee1e5f3fa6",
        dayType: "שבת",
        relativeTime: { relation: "לפני השקיעה", minutes: 20 },
        description: "מנחה ערש״ק",
        prayerType: "מנחה",
        order: 4,
        fixedTime: "",
        timeType: "relative",
      },
      {
        id: "197d8f58-ea05-4bab-a2f6-7eae8cf17e47",
        dayType: "שבת",
        relativeTime: { relation: "לפני השקיעה", minutes: 20 },
        description: "שחרית",
        prayerType: "שחרית",
        order: 5,
        fixedTime: "07:30",
        timeType: "fixed",
      },
      {
        id: "a980697b-4fc6-46d1-948a-4a9be5406c87",
        dayType: "חול",
        relativeTime: { relation: "לפני השקיעה", minutes: 20 },
        description: "שיעור דף יומי",
        prayerType: "שחרית",
        order: 6,
        fixedTime: "20:00",
        timeType: "fixed",
      },
      {
        id: "3568818a-a793-403a-93ab-ffeb685778ec",
        dayType: "שבת",
        relativeTime: { relation: "לפני השקיעה", minutes: 20 },
        description: "מנחה",
        prayerType: "מנחה",
        order: 7,
        fixedTime: "17:00",
        timeType: "fixed",
      },
      {
        id: "64a5a8c0-b6be-4eb7-bd36-af0d27386ae4",
        dayType: "שבת",
        relativeTime: { relation: "אחרי השקיעה", minutes: 40 },
        description: 'ערבחת מוצ"ש',
        prayerType: "ערבית",
        order: 8,
        fixedTime: "",
        timeType: "relative",
      },
    ],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "synagogues"), {
        ...newSynagogue,
        lastConnection: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error adding synagogue:", error);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            שם בית הכנסת
          </label>
          <input
            type="text"
            value={newSynagogue.name}
            onChange={(e) =>
              setNewSynagogue({ ...newSynagogue, name: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            טלפון
          </label>
          <input
            type="tel"
            value={newSynagogue.phone}
            onChange={(e) =>
              setNewSynagogue({ ...newSynagogue, phone: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {!/^(\+972|0)([23489]|5[0248]|77)\d{7}$/.test(newSynagogue.phone) &&
            newSynagogue.phone !== "" && (
              <p className="text-red-500 text-sm mt-1">מספר טלפון לא תקין</p>
            )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            כתובת
          </label>
          <input
            type="text"
            value={newSynagogue.address}
            onChange={(e) =>
              setNewSynagogue({ ...newSynagogue, address: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">עיר</label>
          <select
            value={newSynagogue.city}
            onChange={(e) =>
              setNewSynagogue({ ...newSynagogue, city: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            זמן הדלקת נרות לפני שקיעה (בדקות)
          </label>
          <input
            type="number"
            min="18"
            max="40"
            value={newSynagogue.candleLightingOffset}
            onChange={(e) =>
              setNewSynagogue({
                ...newSynagogue,
                candleLightingOffset: parseInt(e.target.value),
              })
            }
            className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-[70px] text-center"
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
