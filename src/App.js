import './App.css';
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Modify from "./pages/Modify";
import Review from "./pages/Review";
import Overview from "./pages/Overview";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} /> {/* Shouldn't apply anymore, but left for safety */}
        <Route path="/chor.io" element={<Landing/>} />
        <Route path="/chor.io/modify/:id" element={<Modify/>} />
        <Route path="/chor.io/review" element={<Review/>} />
        <Route path="/chor.io/settings" element={<Settings/>} />
        <Route path="/chor.io/overview" element={<Overview/>} />
      </Routes>
    </Router>
  );
}

export default App;
