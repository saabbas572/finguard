import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ScenarioBuilder from './pages/ScenarioBuilder';
import Alerts from './pages/Alerts';
import Swagger from './pages/Swagger';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/builder" element={
            <ProtectedRoute><ScenarioBuilder /></ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute><Alerts /></ProtectedRoute>
          } />
          <Route path="/swagger" element={<Swagger />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;