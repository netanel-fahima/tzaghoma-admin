import React, { useState } from "react";
import { Plus, Building2, Users } from "lucide-react";
import type { Synagogue, User } from "../types";
import AssignUserModal from "./AssignUserModal";
import AddSynagogueForm from "./AddSynagogueForm";
import SynagogueList from "./SynagogueList";
import SynagogueConnectionGraph from "./SynagogueConnectionGraph";
import EmergencyMessages from "./EmergencyMessages";
import EditSynagogueModal from "./EditSynagogueModal";
import EditSynagogueDetailsModal from "./EditSynagogueDetailsModal";
import PrayerTimesModal from "./PrayerTimesModal";
import BackgroundSelectorModal from "./BackgroundSelectorModal";

interface AdminDashboardProps {
  synagogues: Synagogue[];
  users: User[];
  userRole: string;
}

export default function AdminDashboard({
  synagogues,
  users,
  userRole,
}: AdminDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSynagogue, setSelectedSynagogue] = useState<string | null>(
    null
  );

  return (
    <>
      {userRole === "admin" && (
        <div className="mb-8">
          <EmergencyMessages />
          <SynagogueConnectionGraph
            synagogues={synagogues}
            userRole={userRole}
          />
        </div>
      )}

      {showUsersModal && selectedSynagogue && (
        <AssignUserModal
          users={users}
          synagogueId={selectedSynagogue}
          onClose={() => setShowUsersModal(false)}
        />
      )}

      {(userRole === "admin" || userRole === "technician") && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 ml-2" />
            הוסף בית כנסת חדש
          </button>
        </div>
      )}

      {showAddForm && (
        <AddSynagogueForm
          users={users}
          userRole={userRole}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <SynagogueList
        synagogues={synagogues}
        users={users}
        userRole={userRole}
        onSelectSynagogue={(id) => {
          setSelectedSynagogue(id);
          setShowUsersModal(true);
        }}
        onEditSynagogue={(id) => {
          setSelectedSynagogue(id);
          setShowEditModal(true);
        }}
        onEditPrayerTimes={(id) => {
          setSelectedSynagogue(id);
          setShowPrayerTimesModal(true);
        }}
        onEditDetails={(id) => {
          setSelectedSynagogue(id);
          setShowDetailsModal(true);
        }}
        onEditBackground={(id) => {
          setSelectedSynagogue(id);
          setShowBackgroundModal(true);
        }}
      />
      {showEditModal && selectedSynagogue && (
        <EditSynagogueModal
          synagogue={synagogues.find((s) => s.id === selectedSynagogue)!}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {showPrayerTimesModal && selectedSynagogue && (
        <PrayerTimesModal
          synagogue={synagogues.find((s) => s.id === selectedSynagogue)!}
          onClose={() => setShowPrayerTimesModal(false)}
        />
      )}
      {showBackgroundModal && selectedSynagogue && (
        <BackgroundSelectorModal
          synagogue={synagogues.find((s) => s.id === selectedSynagogue)!}
          onClose={() => setShowBackgroundModal(false)}
        />
      )}
      {showDetailsModal && selectedSynagogue && (
        <EditSynagogueDetailsModal
          synagogue={synagogues.find((s) => s.id === selectedSynagogue)!}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
