import './App.css';
import Landing from "./pages/Landing";
import RoutineHome from "./pages/routineHome";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/chor.io" element={<Landing/>} />
        <Route path="/routineHome" element={<RoutineHome/>} />
      </Routes>
    </Router>
  );
}

export default App;
