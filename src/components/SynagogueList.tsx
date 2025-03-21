import React from "react";
import {
  Building2,
  Users,
  X,
  Edit2,
  Clock,
  Eye,
  Image,
  Settings,
} from "lucide-react";
import type { Synagogue, User } from "../types";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

interface SynagogueListProps {
  synagogues: Synagogue[];
  users: User[];
  userRole: string;
  onSelectSynagogue: (id: string) => void;
  onEditSynagogue?: (id: string) => void;
  onEditPrayerTimes?: (id: string) => void;
  onEditBackground?: (id: string) => void;
  onEditDetails?: (id: string) => void;
}

export default function SynagogueList({
  synagogues,
  users,
  userRole,
  onSelectSynagogue,
  onEditSynagogue,
  onEditPrayerTimes,
  onEditBackground,
  onEditDetails,
}: SynagogueListProps) {
  const navigate = useNavigate();

  async function removeSynagogueFromUser(userId: string, synagogueId: string) {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const currentSynagogueIds = userDoc.data()?.synagogueIds || [];

      await updateDoc(userRef, {
        synagogueIds: currentSynagogueIds.filter((id) => id !== synagogueId),
      });
    } catch (error) {
      console.error("Error removing synagogue:", error);
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center">
        <Building2 className="h-6 w-6 text-indigo-600 ml-2" />
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          רשימת בתי כנסת
        </h3>
      </div>
      <div className="border-t border-gray-200">
        {synagogues.map((synagogue) => (
          <div
            key={synagogue.id}
            className="px-4 py-5 sm:p-6 border-b border-gray-200"
          >
            <h4 className="text-lg font-semibold">{synagogue.name}</h4>
            <div className="mt-2 flex gap-2">
              {userRole === "admin" && (
                <>
                  <button
                    onClick={() => onSelectSynagogue(synagogue.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    <Users className="h-4 w-4 ml-1" />
                    הוסף משתמש
                  </button>
                  <button
                    onClick={() => onEditDetails?.(synagogue.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    title="ערוך פרטי בית כנסת"
                  >
                    <Settings className="h-4 w-4 ml-1" />
                    עריכת פרטים
                  </button>
                </>
              )}
              {onEditSynagogue && (
                <button
                  onClick={() => onEditSynagogue(synagogue.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  title="ערוך כותרות ומלל"
                >
                  <Edit2 className="h-4 w-4 ml-1" />
                  עריכת כותרות ומלל
                </button>
              )}
              {onEditPrayerTimes && (
                <>
                  <button
                    onClick={() => onEditPrayerTimes(synagogue.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    title="ערוך זמני תפילות"
                  >
                    <Clock className="h-4 w-4 ml-1" />
                    זמני תפילות
                  </button>
                  <button
                    onClick={() => onEditBackground?.(synagogue.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    title="שנה רקע"
                  >
                    <Image className="h-4 w-4 ml-1" />
                    שנה רקע
                  </button>
                  <button
                    onClick={() => navigate(`/?synId=${synagogue.id}`)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                    title="צפה בתצוגה"
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    צפה בתצוגה
                  </button>
                </>
              )}
            </div>
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700">
                משתמשים משויכים:
              </h5>
              <div className="mt-1 space-y-1">
                {users
                  .filter(
                    (u) =>
                      Array.isArray(u.synagogueIds) &&
                      u.synagogueIds.includes(synagogue.id)
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{user.name || user.email}</span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {user.role === "gabbai" && "גבאי"}
                          {user.role === "security" && "קב״ט"}
                          {user.role === "technician" && "טכנאי"}
                        </span>
                      </div>
                      {userRole === "admin" && (
                        <button
                          onClick={() =>
                            removeSynagogueFromUser(user.id, synagogue.id)
                          }
                          className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="הסר משתמש"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                {users.filter(
                  (u) =>
                    Array.isArray(u.synagogueIds) &&
                    u.synagogueIds.includes(synagogue.id)
                ).length === 0 && (
                  <p className="text-sm text-gray-500">אין משתמשים משויכים</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">טלפון: {synagogue.phone}</p>
            <p className="text-sm text-gray-600">
              כתובת: {synagogue.address}, {synagogue.city}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              חיבור אחרון:{" "}
              {new Date(synagogue.lastConnection).toLocaleString("he-IL")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
