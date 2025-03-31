import React from "react";
import { X, Edit2, Check, XCircle, Trash2 } from "lucide-react";
import type { User } from "../types";
import { israelCities } from "../data/israelCities";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

interface UsersListProps {
  users: User[];
  onClose: () => void;
}

interface EditingUser {
  id: string;
  role: string;
  name: string;
  city: string;
}

export default function UsersList({ users, onClose }: UsersListProps) {
  const [editingUser, setEditingUser] = React.useState<EditingUser | null>(
    null
  );

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: string; city?: string }
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { ...updates, name: editingUser?.name });
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${email}?`)) {
      return;
    }

    try {
      // מחיקת המשתמש מ-Firestore
      await deleteDoc(doc(db, "users", userId));

      // // מחיקת המשתמש מ-Firebase Auth
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("שגיאה במחיקת המשתמש");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">רשימת משתמשים</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg "
            >
              <div className="flex-grow">
                {editingUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="הכנס שם"
                  />
                ) : (
                  <p className="font-medium">{user.name || user.email}</p>
                )}
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">תפקיד: </span>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value,
                          city: editingUser.city,
                        })
                      }
                      className="mr-1 text-sm border rounded px-2 py-0.5"
                    >
                      <option value="gabbai">גבאי</option>
                      <option value="security">קב״ט</option>
                      <option value="technician">טכנאי</option>
                      <option value="admin">מנהל</option>
                    </select>
                  ) : (
                    <span className="mr-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {user.role === "admin" && "מנהל"}
                      {user.role === "gabbai" && "גבאי"}
                      {user.role === "security" && "קב״ט"}
                      {user.role === "technician" && "טכנאי"}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">עיר: </span>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.city || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          city: e.target.value,
                          role: editingUser.role,
                        })
                      }
                      className="mr-1 text-sm border rounded px-2 py-0.5"
                    >
                      <option value="">בחר עיר</option>
                      {israelCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="mr-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                      {user.city || "לא נבחרה עיר"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingUser?.id === user.id ? (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateUser(user.id, {
                          role: editingUser.role,
                          city: editingUser.city,
                        })
                      }
                      className="p-1 text-green-600 hover:text-green-800"
                      title="שמור"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="בטל"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingUser({
                          id: user.id,
                          name: user.name || "",
                          role: user.role,
                          city: user.city || "",
                        })
                      }
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      title="ערוך"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    {/* <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="מחק משתמש"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button> */}
                  </div>
                )}
                {user.synagogueId && (
                  <span className="text-sm text-gray-500">משויך לבית כנסת</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
