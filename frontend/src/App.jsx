import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser } from './api';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import ItemDetail from './pages/ItemDetail';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Messages from './pages/Messages';
import Earnings from './pages/Earnings';

// Components
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/" element={user ? <Navigate to="/marketplace" /> : <Landing />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/marketplace" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/marketplace" /> : <Register onLogin={handleLogin} />}
          />
          <Route
            path="/marketplace"
            element={user ? <Marketplace user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/items/:id"
            element={user ? <ItemDetail user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-item"
            element={user ? <AddItem /> : <Navigate to="/login" />}
          />
          <Route
            path="/messages"
            element={user ? <Messages user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/earnings"
            element={user ? <Earnings /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
