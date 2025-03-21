import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Login from "./pages/Login";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ConnectionStatus from "./pages/ConnectionStatus";
import SynagogueDisplay from "./components/SynagogueDisplay";
import type { Synagogue, User } from "./types";
import Preview from "./pages/Preview";
console.log("React is rendering!");

function App() {
  const [synagogues, setSynagogues] = useState<Synagogue[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // מאזין לשינויים בבתי הכנסת
    const q = query(collection(db, "synagogues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const synagogueData: Synagogue[] = [];
      snapshot.forEach((doc) => {
        synagogueData.push({ id: doc.id, ...doc.data() } as Synagogue);
      });
      setSynagogues(synagogueData);
    });

    // מאזין לשינויים במשתמשים
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const userData: User[] = [];
      snapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userData);
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, []);

  return (
    <Router basename="/dashboard">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SynagogueDisplay />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/preview" element={<Preview />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/connection-status"
            element={
              <PrivateRoute>
                <ConnectionStatus synagogues={synagogues} users={users} />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
