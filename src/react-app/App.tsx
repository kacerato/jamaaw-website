import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "../contexts/AuthContext";
import HomePage from "@/react-app/pages/Home";
import MapPage from "@/react-app/pages/Map";
import SuggestionsPage from "@/react-app/pages/Suggestions";
import AdminPage from "@/react-app/pages/Admin";
import Login from "../components/Login";
import ProtectedRoute from "../components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/sugestoes" element={<SuggestionsPage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

