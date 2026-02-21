import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Layout from "./components/Layout"
import Landing from "./pages/Landing"
import ProducerDashboard from "./pages/ProducerDashboard"
import CreateListing from "./pages/CreateListing"
import BuyerDashboard from "./pages/BuyerDashboard"
import Register from "./pages/Register"
import ImpactCalculator from "./pages/ImpactCalculator"
import Logistics from "./pages/Logistics"
import ComplianceDocs from "./pages/ComplianceDocs"
import DealFlow from "./pages/DealFlow"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="eco-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="register" element={<Register />} />
            <Route path="producer" element={<ProducerDashboard />} />
            <Route path="list-waste" element={<CreateListing />} />
            <Route path="buyer" element={<BuyerDashboard />} />
            <Route path="impact" element={<ImpactCalculator />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="docs" element={<ComplianceDocs />} />
            <Route path="deals" element={<DealFlow />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
