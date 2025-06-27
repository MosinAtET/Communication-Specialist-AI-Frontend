import React, { useEffect, useState } from "react";
import {
  getDashboardStats,
  getScheduledPosts,
  getPendingComments,
  editScheduledPost,
  cancelScheduledPost,
} from "../services/api";
import {
  Calendar,
  MessageSquare,
  Users,
  Bot,
  Clock,
  Globe,
  Save,
  X,
  Twitter,
  Edit,
  Trash2,
  AlertCircle,
  Activity,
  CheckCircle,
} from "lucide-react";

interface ScheduledPost {
  post_id: string;
  platform: string;
  scheduled_time: string;
  content_preview: string;
  campaign_tag: string;
  event_title?: string;
}

interface PendingComment {
  comment_id: string;
  post_id: string;
  platform: string;
  user_name: string;
  comment_text: string;
  classification: string;
  timestamp: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  devto: <Globe className="w-4 h-4 text-blue-500" />, // Replace with Dev.to icon if available
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTime, setEditTime] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  useEffect(() => {
    loadStats();
    loadScheduledPosts();
    loadPendingComments();
    const interval = setInterval(() => {
      loadStats();
      loadScheduledPosts();
      loadPendingComments();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setStats(null);
      showToast("Error loading statistics", "error");
    }
  };

  const loadScheduledPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await getScheduledPosts();
      setScheduledPosts(data);
    } catch {
      setScheduledPosts([]);
      showToast("Error loading scheduled posts", "error");
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadPendingComments = async () => {
    setLoadingComments(true);
    try {
      const data = await getPendingComments();
      setPendingComments(data);
    } catch {
      setPendingComments([]);
      showToast("Error loading pending comments", "error");
    } finally {
      setLoadingComments(false);
    }
  };

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startEditing = (post: ScheduledPost) => {
    setEditingPost(post.post_id);
    setEditContent(post.content_preview);
    // Convert the scheduled time to datetime-local format
    const date = new Date(post.scheduled_time);
    const localDateTime = date.toISOString().slice(0, 16);
    setEditTime(localDateTime);
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditContent("");
    setEditTime("");
  };

  const saveEdit = async (postId: string) => {
    try {
      // Convert datetime-local format to ISO string
      const isoTime = new Date(editTime).toISOString();
      await editScheduledPost(postId, editContent, isoTime);
      showToast("Post updated successfully", "success");
      cancelEditing();
      loadScheduledPosts(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update post";
      showToast(errorMessage, "error");
    }
  };

  const handleCancelPost = async (postId: string, platform: string) => {
    if (
      window.confirm("Are you sure you want to cancel this scheduled post?")
    ) {
      try {
        await cancelScheduledPost(postId, platform);
        showToast("Post cancelled successfully", "success");
        loadScheduledPosts(); // Refresh the list
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to cancel post";
        showToast(errorMessage, "error");
      }
    }
  };

  // Helper to truncate text
  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  return (
    <div className="p-4 md:p-10">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary-700 mb-1">
            Dashboard
          </h2>
          <p className="text-gray-500">Overview and activity</p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 hover:shadow-lg transition">
          <Calendar className="w-7 h-7 text-blue-500 mb-2" />
          <span className="text-2xl font-bold text-blue-700">
            {stats?.total_posts ?? "-"}
          </span>
          <span className="text-gray-600 mt-1">Total Posts</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 hover:shadow-lg transition">
          <MessageSquare className="w-7 h-7 text-yellow-500 mb-2" />
          <span className="text-2xl font-bold text-yellow-700">
            {stats?.pending_comments ?? "-"}
          </span>
          <span className="text-gray-600 mt-1">Pending Comments</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 hover:shadow-lg transition">
          <Users className="w-7 h-7 text-green-500 mb-2" />
          <span className="text-2xl font-bold text-green-700">
            {stats?.total_events ?? "-"}
          </span>
          <span className="text-gray-600 mt-1">Events</span>
        </div>
        <div className="bg-white rounded-xl shadow flex flex-col items-center p-6 hover:shadow-lg transition">
          <Bot className="w-7 h-7 text-purple-500 mb-2" />
          <span className="text-2xl font-bold text-purple-700">
            {stats?.ai_responses ?? "-"}
          </span>
          <span className="text-gray-600 mt-1">AI Responses</span>
        </div>
      </div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Scheduled Posts */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-700">
            <Clock className="w-5 h-5" /> Scheduled Posts
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Platform
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Content
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Scheduled Time
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingPosts ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">
                      Loading...
                    </td>
                  </tr>
                ) : scheduledPosts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-300 py-8">
                      No scheduled posts
                    </td>
                  </tr>
                ) : (
                  scheduledPosts.map((post) => (
                    <tr
                      key={post.post_id}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold uppercase">
                          {platformIcons[post.platform] || (
                            <Globe className="w-4 h-4 text-gray-400" />
                          )}{" "}
                          {post.platform}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top max-w-xs">
                        {editingPost === post.post_id ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            rows={3}
                          />
                        ) : (
                          <span
                            title={post.content_preview}
                            className="block truncate text-gray-800 font-medium"
                          >
                            {truncate(post.content_preview, 80)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-xs text-gray-500 whitespace-nowrap">
                        {editingPost === post.post_id ? (
                          <input
                            type="datetime-local"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded text-xs"
                          />
                        ) : (
                          post.scheduled_time
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {editingPost === post.post_id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(post.post_id)}
                              className="p-1 text-green-600 hover:text-green-800 transition"
                              title="Save changes"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-gray-600 hover:text-gray-800 transition"
                              title="Cancel editing"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(post)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition"
                              title="Edit post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleCancelPost(post.post_id, post.platform)
                              }
                              className="p-1 text-red-600 hover:text-red-800 transition"
                              title="Cancel post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pending Comments */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-700">
            <AlertCircle className="w-5 h-5" /> Pending Comments
          </h3>
          <div className="space-y-4">
            {loadingComments ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : pendingComments.length === 0 ? (
              <div className="text-center text-gray-300 py-8">
                No pending comments
              </div>
            ) : (
              pendingComments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="flex items-start gap-3 bg-yellow-50 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold text-lg">
                    {comment.user_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-800">
                      {comment.user_name}
                    </div>
                    <div className="text-gray-700 mb-1">
                      {truncate(comment.comment_text, 80)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {comment.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-700">
          <Activity className="w-5 h-5" /> Recent Activity
        </h3>
        <ol className="relative border-l border-gray-200 ml-4">
          <li className="mb-8 ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </span>
            <h4 className="font-semibold text-gray-800">
              Dashboard initialized successfully
            </h4>
            <p className="text-xs text-gray-500">Just now</p>
          </li>
          <li className="ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full ring-8 ring-white">
              <Globe className="w-4 h-4 text-green-600" />
            </span>
            <h4 className="font-semibold text-gray-800">
              Monitoring for new comments and mentions
            </h4>
            <p className="text-xs text-gray-500">Active</p>
          </li>
        </ol>
      </div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg bg-white border-l-4 min-w-[250px] ${
            toast.type === "success"
              ? "border-green-500"
              : toast.type === "error"
              ? "border-red-500"
              : "border-blue-500"
          }`}
        >
          <span className="text-sm text-gray-800">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
