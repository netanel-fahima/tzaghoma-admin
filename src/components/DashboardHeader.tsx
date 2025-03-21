import React from 'react';
import { LogOut, Users2 } from 'lucide-react';

interface DashboardHeaderProps {
  name: string | null;
  email: string | null;
  userRole: string;
  onLogout: () => void;
  onShowUsers: () => void;
}

export default function DashboardHeader({ name, email, userRole, onLogout, onShowUsers }: DashboardHeaderProps) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">מערכת ניהול</h1>
            </div>
            <div className="mr-4 flex items-center">
              <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {userRole === 'admin' && 'מנהל'}
                {userRole === 'gabbai' && 'גבאי'}
                {userRole === 'security' && 'קב״ט'}
                {userRole === 'technician' && 'טכנאי'}
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={onShowUsers}
                  className="mr-3 inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Users2 className="h-4 w-4 ml-1" />
                  רשימת משתמשים
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {name && <span className="text-gray-600 ml-4">{name}</span>}
            <span className="text-gray-600 ml-4">{email}</span>
            <button
              onClick={onLogout}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <LogOut className="h-4 w-4 ml-2" />
              התנתק
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}