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
        <Route path="/" element={<Landing/>} />
        <Route path="/chor.io" element={<Landing/>} />
        <Route path="/Modify/:id" element={<Modify/>} />
        <Route path="/Review" element={<Review/>} />
        <Route path="/Settings" element={<Settings/>} />
        <Route path="/Overview" element={<Overview/>} />
      </Routes>
    </Router>
  );
}

export default App;
