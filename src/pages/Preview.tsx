import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { israelCities } from "../data/israelCities";
import type { Synagogue } from "../types";
import { Eye } from "lucide-react";

export default function Preview() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSynagogue, setSelectedSynagogue] = useState<string | null>(
    null
  );
  const [synagogues, setSynagogues] = useState<Synagogue[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCity) {
      setSynagogues([]);
      return;
    }

    const fetchSynagogues = async () => {
      const q = query(
        collection(db, "synagogues"),
        where("city", "==", selectedCity)
      );

      const querySnapshot = await getDocs(q);
      const synagogueData: Synagogue[] = [];
      querySnapshot.forEach((doc) => {
        synagogueData.push({ id: doc.id, ...doc.data() } as Synagogue);
      });
      setSynagogues(synagogueData);
    };

    fetchSynagogues();
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            מסך דיגיטלי בטכנולוגיית ענן מתקדמת
          </h1>
          <p className="text-xl text-gray-600">עיצוב יוקרתי ומפואר</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                עיר
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedSynagogue(null);
                }}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-3 px-4 text-gray-900 text-lg"
              >
                <option value="">בחר עיר</option>
                {israelCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {selectedCity && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  בית כנסת
                </label>
                <select
                  value={selectedSynagogue || ""}
                  onChange={(e) => setSelectedSynagogue(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-3 px-4 text-gray-900 text-lg"
                >
                  <option value="">בחר בית כנסת</option>
                  {synagogues.map((synagogue) => (
                    <option key={synagogue.id} value={synagogue.id}>
                      {synagogue.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedSynagogue && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => navigate(`/?synId=${selectedSynagogue}`)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Eye className="h-5 w-5 ml-2" />
                  צפה בבית הכנסת (לצפייה במסך מחשב)
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-8">
            <img src={new URL("../img/preview.png", import.meta.url).href} />
          </div>
        </div>
      </div>
    </div>
  );
}
