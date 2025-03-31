import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Synagogue, User } from "../types";
import { useSearchParams } from "react-router-dom";

interface ConnectionStatusProps {
  synagogues: Synagogue[];
  users: User[];
}

export default function ConnectionStatus({
  synagogues,
  users,
}: ConnectionStatusProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCity = searchParams.get("city");

  const { connectedSynagogues, disconnectedSynagogues } = useMemo(() => {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

    // סינון בתי הכנסת לפי העיר שנבחרה
    const filteredSynagogues = selectedCity
      ? synagogues.filter((s) => s.city === selectedCity)
      : synagogues;

    return {
      connectedSynagogues: filteredSynagogues.filter(
        (synagogue) => new Date(synagogue.lastConnection) > threeHoursAgo
      ),
      disconnectedSynagogues: filteredSynagogues.filter(
        (synagogue) => new Date(synagogue.lastConnection) <= threeHoursAgo
      ),
    };
  }, [synagogues, selectedCity]);

  // פונקציה למציאת שם הגבאי לפי בית כנסת
  const getGabbaiInfo = (synagogueId: string) => {
    const gabbai = users.find(
      (user) =>
        user.role === "gabbai" && user.synagogueIds?.includes(synagogueId)
    );
    return gabbai
      ? {
          name: gabbai.name || gabbai.email,
          phone: gabbai.phone || "לא הוגדר",
        }
      : {
          name: "לא הוגדר",
          phone: "לא הוגדר",
        };
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <ArrowRight className="h-5 w-5 ml-1" />
            חזרה לדף הניהול
          </button>
        </div>

        <div className="space-y-8">
          {/* בתי כנסת מחוברים */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <span className="text-green-600">בתי כנסת מחוברים</span> (
              {connectedSynagogues.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם בית כנסת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      כתובת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם גבאי
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      טלפון גבאי
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connectedSynagogues.map((synagogue) => {
                    const gabbaiInfo = getGabbaiInfo(synagogue.id);
                    return (
                      <tr key={synagogue.id} className="bg-green-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {synagogue.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {synagogue.address}, {synagogue.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gabbaiInfo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {synagogue.phone}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* בתי כנסת לא מחוברים */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <span className="text-red-600">בתי כנסת מנותקים</span> (
              {disconnectedSynagogues.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם בית כנסת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      כתובת
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם גבאי
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      טלפון גבאי
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disconnectedSynagogues.map((synagogue) => {
                    const gabbaiInfo = getGabbaiInfo(synagogue.id);
                    return (
                      <tr key={synagogue.id} className="bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {synagogue.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {synagogue.address}, {synagogue.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gabbaiInfo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {synagogue.phone}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
