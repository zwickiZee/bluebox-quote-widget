import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuoteWidget from './QuoteWidget';
import RegionEditor from './RegionEditor';
import AdminCardViewer from './AdminCardViewer';
import LeadViewer from "./LeadViewer";
import { LoadScript } from "@react-google-maps/api";
import Header from "./components/Header";


const GOOGLE_MAPS_API_KEY = "AIzaSyBTRCYGgS78_qsakqGJUW9bmjaztO1JqLM"; // add restrictions later

export default function App() {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="bg-white min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <QuoteWidget />
                </main>
              </div>
            }
          />
          <Route path="/admin" element={<RegionEditor />} />
          <Route path="/admin/cards" element={<AdminCardViewer />} />
          <Route path="/admin/leads" element={<LeadViewer />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}
