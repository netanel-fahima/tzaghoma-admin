import React, { useState } from "react";
import { X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface BackgroundSelectorModalProps {
  synagogue: {
    id: string;
    backgroundImage?: string;
  };
  onClose: () => void;
}

const backgrounds = [
  {
    id: "background-1",
    url: new URL("../img/bg/1.jpg", import.meta.url).href,
  },
  {
    id: "background-2",
    url: new URL("../img/bg/2.jpg", import.meta.url).href,
  },
  {
    id: "background-3",
    url: new URL("../img/bg/3.jpg", import.meta.url).href,
  },
  {
    id: "background-4",
    url: new URL("../img/bg/4.jpg", import.meta.url).href,
  },
  {
    id: "background-5",
    url: new URL("../img/bg/5.jpg", import.meta.url).href,
  },
  {
    id: "background-6",
    url: new URL("../img/bg/6.jpg", import.meta.url).href,
  },
  {
    id: "background-7",
    url: new URL("../img/bg/7.jpg", import.meta.url).href,
  },
];

export default function BackgroundSelectorModal({
  synagogue,
  onClose,
}: BackgroundSelectorModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(
    synagogue.backgroundImage || backgrounds[0].url
  );
  const [previewBackground, setPreviewBackground] =
    useState(selectedBackground);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const synagogueRef = doc(db, "synagogues", synagogue.id);
      await updateDoc(synagogueRef, {
        backgroundImage: selectedBackground,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating background:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto"
        dir="rtl"
      >
        {" "}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">בחירת רקע</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            תצוגה מקדימה
          </h4>
          <div
            className="w-full h-60 sm:h-96 rounded-lg border-2 border-gray-200 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${previewBackground})` }}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden h-20 sm:h-24 ${
                  selectedBackground === bg.url ? "ring-2 ring-indigo-500" : ""
                }`}
                onMouseEnter={() => setPreviewBackground(bg.url)}
                onMouseLeave={() => setPreviewBackground(selectedBackground)}
                onClick={() => setSelectedBackground(bg.url)}
              >
                <img
                  src={bg.url}
                  alt={`רקע ${bg.id}`}
                  className="w-full h-full object-cover"
                />
                {selectedBackground === bg.url && (
                  <div className="absolute inset-0 bg-indigo-500 bg-opacity-20" />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-start gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              שמור שינויים
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
