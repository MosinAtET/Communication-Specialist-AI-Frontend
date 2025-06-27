import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SchedulePost from "./pages/SchedulePost";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule-post" element={<SchedulePost />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
