import React from "react";
import { LogOut, Users2 } from "lucide-react";

interface DashboardHeaderProps {
  name: string | null;
  email: string | null;
  userRole: string;
  onLogout: () => void;
  onShowUsers: () => void;
}

export default function DashboardHeader({
  name,
  email,
  userRole,
  onLogout,
  onShowUsers,
}: DashboardHeaderProps) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-3 space-y-3 md:space-y-0">
          {/* טייטל ותפקיד */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 rtl:space-x-reverse">
            <h1 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">
              מערכת ניהול
            </h1>
            <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full w-fit">
              {userRole === "admin" && "מנהל"}
              {userRole === "gabbai" && "גבאי"}
              {userRole === "security" && "קב״ט"}
              {userRole === "technician" && "טכנאי"}
            </span>
            {userRole === "admin" && (
              <button
                onClick={onShowUsers}
                className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                <Users2 className="h-4 w-4 ml-1" />
                רשימת משתמשים
              </button>
            )}
          </div>

          {/* שם, אימייל וכפתור התנתקות */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 rtl:space-x-reverse text-sm text-gray-600">
            {name && <span>{name}</span>}
            <span>{email}</span>
            <button
              onClick={onLogout}
              className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
