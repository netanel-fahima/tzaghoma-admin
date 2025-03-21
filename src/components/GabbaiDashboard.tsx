import React from 'react';
import { Edit2, Clock, Eye, Image } from 'lucide-react';
import type { Synagogue } from '../types';
import { useNavigate } from 'react-router-dom';

interface GabbaiDashboardProps {
  synagogues: Synagogue[];
  onEditSynagogue: (id: string) => void;
  onEditPrayerTimes: (id: string) => void;
  onEditBackground: (id: string) => void;
}

export default function GabbaiDashboard({ synagogues, onEditSynagogue, onEditPrayerTimes, onEditBackground }: GabbaiDashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      {synagogues.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">בתי הכנסת שלך</h3>
          {synagogues.map(synagogue => (
            <div key={synagogue.id} className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
              <div className="px-4 py-5 sm:px-6">
                <h4 className="text-xl font-semibold">{synagogue.name}</h4>
                <div className="flex gap-3 mt-4 justify-center">
                  <button
                    onClick={() => onEditSynagogue(synagogue.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 gap-2"
                    title="ערוך כותרות ומלל"
                  >
                    <Edit2 className="h-4 w-4" />
                    עריכת כותרות ומלל
                  </button>
                  <button
                    onClick={() => onEditPrayerTimes(synagogue.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 gap-2"
                    title="ערוך זמני תפילות"
                  >
                    <Clock className="h-4 w-4" />
                    זמני תפילות
                  </button>
                  <button
                    onClick={() => onEditBackground(synagogue.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 gap-2"
                    title="שנה רקע"
                  >
                    <Image className="h-4 w-4" />
                    שנה רקע
                  </button>
                  <button
                    onClick={() => navigate(`/?synId=${synagogue.id}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 gap-2"
                    title="צפה בתצוגה"
                  >
                    <Eye className="h-4 w-4" />
                    צפה בתצוגה
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p className="text-gray-600">טלפון: {synagogue.phone}</p>
                <p className="text-gray-600">כתובת: {synagogue.address}, {synagogue.city}</p>
                <p className="text-sm text-gray-500 mt-2">
                  חיבור אחרון: {new Date(synagogue.lastConnection).toLocaleString('he-IL')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900">לא משויך לבית כנסת</h3>
          <p className="mt-2 text-sm text-gray-600">פנה למנהל המערכת כדי לקבל שיוך לבית כנסת</p>
        </div>
      )}
    </div>
  );
}