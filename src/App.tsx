import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import SchedulePost from "./pages/SchedulePost";
import ScheduledPosts from "./pages/ScheduledPosts";
import PendingComments from "./pages/PendingComments";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/schedule-post" replace />} />
          <Route path="/schedule-post" element={<SchedulePost />} />
          <Route path="/scheduled-posts" element={<ScheduledPosts />} />
          <Route path="/pending-comments" element={<PendingComments />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
