import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type {
  Synagogue,
  PrayerTime,
  PrayerType,
  DayType,
  TimeRelation,
  TimeType,
} from "../types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface PrayerTimesModalProps {
  synagogue: Synagogue;
  onClose: () => void;
}

export default function PrayerTimesModal({
  synagogue,
  onClose,
}: PrayerTimesModalProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(
    (synagogue.prayerTimes || []).map((time, index) => ({
      ...time,
      order: index,
    }))
  );

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(prayerTimes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // עדכון מספרי הסדר
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setPrayerTimes(updatedItems);
  };

  const handleAddPrayerTime = () => {
    const newPrayerTime: PrayerTime = {
      id: crypto.randomUUID(),
      dayType: "חול",
      prayerType: "מנחה",
      description: "",
      timeType: "relative",
      fixedTime: "",
      relativeTime: { relation: "לפני השקיעה", minutes: 20 },
      order: prayerTimes.length,
    };
    setPrayerTimes([...prayerTimes, newPrayerTime]);
  };

  const handleUpdatePrayerTime = (id: string, updates: Partial<PrayerTime>) => {
    setPrayerTimes(
      prayerTimes.map((time) =>
        time.id === id ? { ...time, ...updates } : time
      )
    );
  };

  const handleDeletePrayerTime = (id: string) => {
    setPrayerTimes(prayerTimes.filter((time) => time.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const synagogueRef = doc(db, "synagogues", synagogue.id);
      await updateDoc(synagogueRef, {
        prayerTimes,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating prayer times:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl p-4 sm:p-8 max-w-7xl w-full mx-4 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                ניהול זמני תפילות
              </h3>
              <span className="mr-2 sm:mr-3 text-sm text-gray-500 hidden sm:inline">
                ({synagogue.name})
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-4">
              ניתן לגרור כדי לשנות סדר התצוגה
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="prayer-times">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {prayerTimes
                    .sort((a, b) => a.order - b.order)
                    .map((time, index) => (
                      <Draggable
                        key={time.id}
                        draggableId={time.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors cursor-move"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-center flex-grow">
                              <div>
                                <select
                                  value={time.dayType}
                                  onChange={(e) =>
                                    handleUpdatePrayerTime(time.id, {
                                      dayType: e.target.value as DayType,
                                    })
                                  }
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                                  placeholder="סוג יום"
                                >
                                  <option value="חול">חול</option>
                                  <option value="שבת">שבת</option>
                                </select>
                              </div>

                              <div>
                                <select
                                  value={time.prayerType}
                                  onChange={(e) =>
                                    handleUpdatePrayerTime(time.id, {
                                      prayerType: e.target.value as PrayerType,
                                    })
                                  }
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                                  placeholder="סוג תפילה"
                                >
                                  <option value="מנחה">מנחה</option>
                                  <option value="ערבית">ערבית</option>
                                  <option value="שחרית">שחרית</option>
                                </select>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  value={time.description}
                                  onChange={(e) =>
                                    handleUpdatePrayerTime(time.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                  placeholder="למשל: מנחה ערש״ק"
                                />
                              </div>

                              <div>
                                <select
                                  value={time.timeType}
                                  onChange={(e) =>
                                    handleUpdatePrayerTime(time.id, {
                                      timeType: e.target.value as TimeType,
                                    })
                                  }
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                                  placeholder="סוג זמן"
                                >
                                  <option value="fixed">שעה קבועה</option>
                                  <option value="relative">שעה יחסית</option>
                                </select>
                              </div>

                              {time.timeType === "fixed" ? (
                                <div>
                                  <input
                                    type="time"
                                    value={time.fixedTime}
                                    onChange={(e) =>
                                      handleUpdatePrayerTime(time.id, {
                                        fixedTime: e.target.value,
                                      })
                                    }
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <select
                                      value={time.relativeTime?.relation}
                                      onChange={(e) =>
                                        handleUpdatePrayerTime(time.id, {
                                          relativeTime: {
                                            ...time.relativeTime,
                                            relation: e.target
                                              .value as TimeRelation,
                                          },
                                        })
                                      }
                                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white py-2 px-3 text-gray-900 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236B7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                                      placeholder="יחס לזמן"
                                    >
                                      <option value="לפני השקיעה">
                                        לפני השקיעה
                                      </option>
                                      <option value="אחרי השקיעה">
                                        אחרי השקיעה
                                      </option>
                                      <option value="לפני הזריחה">
                                        לפני הזריחה
                                      </option>
                                      <option value="אחרי הזריחה">
                                        אחרי הזריחה
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      value={time.relativeTime?.minutes}
                                      onChange={(e) =>
                                        handleUpdatePrayerTime(time.id, {
                                          relativeTime: {
                                            ...time.relativeTime,
                                            minutes: parseInt(e.target.value),
                                          },
                                        })
                                      }
                                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
                                      placeholder="דקות"
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePrayerTime(time.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleAddPrayerTime}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף זמן תפילה
            </button>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                שמור שינויים
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                ביטול
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
