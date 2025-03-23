import React, { useMemo, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Synagogue, User, EmergencyMessage } from "../types";
import { israelCities } from "../data/israelCities";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface SynagogueConnectionGraphProps {
  synagogues: Synagogue[];
  currentUser?: User;
  userRole?: string;
}

export default function SynagogueConnectionGraph({
  synagogues,
  currentUser,
  userRole,
}: SynagogueConnectionGraphProps) {
  const [selectedCity, setSelectedCity] = React.useState<string>(
    currentUser?.city || ""
  );

  useEffect(() => {
    if (currentUser?.city) {
      setSelectedCity(currentUser.city);
    }
  });

  const [emergencyMessages, setEmergencyMessages] = useState<
    EmergencyMessage[]
  >([]);
  const navigate = useNavigate();

  // חישוב סטטיסטיקות קריאת הודעות
  const messageStats = useMemo(() => {
    if (!emergencyMessages.length) return null;

    const filteredSynagogues = selectedCity
      ? synagogues.filter((s) => s.city === selectedCity)
      : synagogues;

    const totalSynagogues = filteredSynagogues.length;

    // חישוב כמה בתי כנסת קראו את כל ההודעות
    const readAllMessages = filteredSynagogues.filter((synagogue) => {
      return emergencyMessages.every((message) =>
        message.readBy?.includes(synagogue.id)
      );
    }).length;

    return {
      total: totalSynagogues,
      readAll: readAllMessages,
      unread: totalSynagogues - readAllMessages,
    };
  }, [emergencyMessages, synagogues, selectedCity]);

  useEffect(() => {
    const city = userRole === "security" ? currentUser?.city : selectedCity;
    if (!city) return;

    const q = query(
      collection(db, "emergencyMessages"),
      where("city", "==", city)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: EmergencyMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as EmergencyMessage);
      });
      setEmergencyMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedCity, currentUser?.city, userRole]);

  const data = useMemo(() => {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    const filteredSynagogues = selectedCity
      ? synagogues.filter((s) => s.city === selectedCity)
      : synagogues;

    const connected = filteredSynagogues.filter(
      (synagogue) => new Date(synagogue.lastConnection) > threeHoursAgo
    ).length;

    const disconnected = filteredSynagogues.length - connected;

    return [
      { name: "מחוברים", value: connected, color: "#4ade80" },
      { name: "לא מחוברים", value: disconnected, color: "#f87171" },
    ];
  }, [synagogues, selectedCity]);

  if (synagogues.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">סטטוס חיבור בתי כנסת</h3>
        <div className="flex items-center gap-4">
          {selectedCity && (
            <button
              onClick={() =>
                navigate(`/admin/connection-status?city=${selectedCity}`)
              }
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
              style={{ display: selectedCity ? "block" : "none" }}
            >
              צפה ברשימה מלאה
            </button>
          )}
          {userRole !== "security" && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            >
              <option value="">כל הערים</option>
              {israelCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-1/2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-1/2 pr-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                בתי כנסת מחוברים
              </h4>
              <p className="text-2xl font-bold text-green-500">
                {data[0].value} מתוך {data[0].value + data[1].value}
              </p>
              <p className="text-sm text-gray-500">מחוברים למערכת</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                בתי כנסת לא מחוברים
              </h4>
              <p className="text-2xl font-bold text-red-500">
                {data[1].value} מתוך {data[0].value + data[1].value}
              </p>
              <p className="text-sm text-gray-500">מנותקים מהמערכת</p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-gray-600">
                * הגרף מציג את מצב החיבור הנוכחי של בתי הכנסת
                {selectedCity ? ` בעיר ${selectedCity}` : ""}
              </p>
              {emergencyMessages.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    הודעות חירום פעילות{" "}
                    {selectedCity ? `בעיר ${selectedCity}` : ""}
                    {messageStats && (
                      <>
                        <p className="text-sm text-red-600 mt-2">
                          בתי כנסת שקראו את כל ההודעות: {messageStats.readAll}{" "}
                          מתוך {messageStats.total}
                        </p>
                        <p className="text-sm text-red-600">
                          בתי כנסת שטרם קראו את כל ההודעות:{" "}
                          {messageStats.unread}
                        </p>
                      </>
                    )}
                  </h4>
                  <p className="text-sm text-red-600">
                    {emergencyMessages.length} הודעות חירום פעילות
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
