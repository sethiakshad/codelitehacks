import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Landing from "./pages/Landing"
import ProducerDashboard from "./pages/ProducerDashboard"
import CreateListing from "./pages/CreateListing"
import BuyerDashboard from "./pages/BuyerDashboard"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Logistics from "./pages/Logistics"
import ComplianceDocs from "./pages/ComplianceDocs"
import DealFlow from "./pages/DealFlow"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="eco-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              {/* Protected Routes */}
              <Route path="producer" element={<ProtectedRoute><ProducerDashboard /></ProtectedRoute>} />
              <Route path="list-waste" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
              <Route path="buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
              <Route path="logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
              <Route path="docs" element={<ProtectedRoute><ComplianceDocs /></ProtectedRoute>} />
              <Route path="deals" element={<ProtectedRoute><DealFlow /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
