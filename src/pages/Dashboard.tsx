import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import AdminDashboard from '../components/AdminDashboard';
import EmergencyMessages from '../components/EmergencyMessages';
import GabbaiDashboard from '../components/GabbaiDashboard';
import { useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Synagogue, User } from '../types';
import BackgroundSelectorModal from '../components/BackgroundSelectorModal';
import UsersList from '../components/UsersList';
import SynagogueConnectionGraph from '../components/SynagogueConnectionGraph';
import EditSynagogueModal from '../components/EditSynagogueModal';
import PrayerTimesModal from '../components/PrayerTimesModal';

export default function Dashboard() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [synagogues, setSynagogues] = useState<Synagogue[]>([]);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [selectedSynagogue, setSelectedSynagogue] = useState<string | null>(null);
  const [userSynagogues, setUserSynagogues] = useState<Synagogue[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  React.useEffect(() => {
    const q = query(collection(db, 'synagogues'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const synagogueData: Synagogue[] = [];
      snapshot.forEach((doc) => {
        synagogueData.push({ id: doc.id, ...doc.data() } as Synagogue);
      });
      setSynagogues(synagogueData);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (userRole === 'admin') {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userData: User[] = [];
        snapshot.forEach((doc) => {
          userData.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(userData);
      });
      return unsubscribe;
    }
  }, [userRole]);

  React.useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setCurrentUserData({ id: doc.id, ...doc.data() } as User);
        }
      });
      return unsubscribe;
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (currentUser && userRole === 'gabbai') {
      const userRef = doc(db, 'users', currentUser.uid);
      const fetchSynagogues = async () => {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().synagogueIds?.length > 0) {
          const synagogueIds = userDoc.data().synagogueIds;
          const unsubscribes = synagogueIds.map(id => {
            const synagogueRef = doc(db, 'synagogues', id);
            return onSnapshot(synagogueRef, (doc) => {
              if (doc.exists()) {
                setUserSynagogues(prev => {
                  const newSynagogue = { id: doc.id, ...doc.data() } as Synagogue;
                  const filtered = prev.filter(s => s.id !== doc.id);
                  return [...filtered, newSynagogue];
                });
              }
            });
          });
          return () => unsubscribes.forEach(unsubscribe => unsubscribe());
        }
      };
      
      fetchSynagogues();
    }
  }, [currentUser, userRole]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/admin/login');
    } catch {
      console.error('Failed to log out');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        email={currentUser?.email}
        name={currentUserData?.name}
        userRole={userRole || ''}
        onLogout={handleLogout}
        onShowUsers={() => setShowUsersList(true)}
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {(userRole === 'admin' || userRole === 'technician') && (
            <AdminDashboard
              synagogues={synagogues}
              users={users}
              userRole={userRole || ''}
            />
          )}
          {userRole === 'security' && (
            <div className="mb-8">
              <EmergencyMessages />
              <SynagogueConnectionGraph
                synagogues={synagogues}
                currentUser={currentUserData}
                userRole={userRole}
              />
            </div>
          )}

          {userRole === 'gabbai' && (
            <GabbaiDashboard
              synagogues={userSynagogues}
              onEditSynagogue={(id) => {
                setSelectedSynagogue(id);
                setShowEditModal(true);
              }}
              onEditPrayerTimes={(id) => {
                setSelectedSynagogue(id);
                setShowPrayerTimesModal(true);
              }}
              onEditBackground={(id) => {
                setSelectedSynagogue(id);
                setShowBackgroundModal(true);
              }}
            />
          )}
        </div>
      </div>
      {showUsersList && userRole === 'admin' && (
        <UsersList users={users} onClose={() => setShowUsersList(false)} />
      )}
      {showEditModal && selectedSynagogue && (
        <EditSynagogueModal
          synagogue={userSynagogues.find(s => s.id === selectedSynagogue)!}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {showPrayerTimesModal && selectedSynagogue && (
        <PrayerTimesModal
          synagogue={userSynagogues.find(s => s.id === selectedSynagogue)!}
          onClose={() => setShowPrayerTimesModal(false)}
        />
      )}
      {showBackgroundModal && selectedSynagogue && (
        <BackgroundSelectorModal
          synagogue={userSynagogues.find(s => s.id === selectedSynagogue)!}
          onClose={() => setShowBackgroundModal(false)}
        />
      )}
    </div>
  );
}