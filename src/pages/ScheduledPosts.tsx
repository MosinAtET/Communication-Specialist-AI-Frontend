import React, { useEffect, useState } from "react";
import {
  getScheduledPosts,
  editScheduledPost,
  cancelScheduledPost,
} from "../services/api";
import {
  Calendar,
  Clock,
  Globe,
  Twitter,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Linkedin,
} from "lucide-react";

interface ScheduledPost {
  post_id: string;
  platform: string;
  scheduled_time: string;
  content_preview: string;
  campaign_tag: string;
  event_title?: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  devto: <Globe className="w-4 h-4 text-blue-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-500" />,
};

const platformNames: Record<string, string> = {
  devto: "Dev.to",
  twitter: "Twitter",
  linkedin: "LinkedIn",
};

const ScheduledPosts: React.FC = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTime, setEditTime] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  useEffect(() => {
    loadScheduledPosts();
    const interval = setInterval(loadScheduledPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadScheduledPosts = async () => {
    setLoading(true);
    try {
      const data = await getScheduledPosts();
      // Sort by scheduled time (most recent first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.scheduled_time);
        const dateB = new Date(b.scheduled_time);
        return dateB.getTime() - dateA.getTime();
      });
      setScheduledPosts(sortedData);
    } catch {
      setScheduledPosts([]);
      showToast("Error loading scheduled posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startEditing = (post: ScheduledPost) => {
    setEditingPost(post.post_id);
    setEditContent(post.content_preview);
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
      const isoTime = new Date(editTime).toISOString();
      await editScheduledPost(postId, editContent, isoTime);
      showToast("Post updated successfully", "success");
      cancelEditing();
      loadScheduledPosts();
      // Close modal if editing the selected post
      if (selectedPost?.post_id === postId) {
        setSelectedPost(null);
      }
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
        loadScheduledPosts();
        // Close modal if deleting the selected post
        if (selectedPost?.post_id === postId) {
          setSelectedPost(null);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to cancel post";
        showToast(errorMessage, "error");
      }
    }
  };

  // Helper to robustly parse date string in 'YYYY-MM-DD HH:MM:SS IST+0530' or similar to ISO
  const parseDateString = (dateTimeStr: string) => {
    if (!dateTimeStr) return new Date("");
    // Remove timezone abbreviation (e.g., ' IST') before offset
    let cleaned = dateTimeStr.replace(/ [A-Z]{2,5}(?=[+-]\d{4})/, "");
    if (cleaned.includes("T")) return new Date(cleaned);
    // If has timezone like +0530, convert to +05:30
    const match = cleaned.match(
      /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{4})/
    );
    if (match) {
      const [_, date, time, tz] = match;
      const tzIso = tz.slice(0, 3) + ":" + tz.slice(3);
      return new Date(`${date}T${time}${tzIso}`);
    }
    // Otherwise, just replace space with T
    return new Date(cleaned.replace(" ", "T"));
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = parseDateString(dateTimeStr);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateTimeStr;
    }
  };

  const getTimeUntilScheduled = (dateTimeStr: string) => {
    try {
      const scheduledDate = parseDateString(dateTimeStr);
      const now = new Date();
      const diff = scheduledDate.getTime() - now.getTime();
      if (isNaN(diff)) return "Unknown";
      if (diff < 0) {
        return "Overdue";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) {
        return `${days}d ${hours}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return "Unknown";
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary-700 mb-1">
            Scheduled Posts
          </h2>
          <p className="text-gray-500">
            Manage your scheduled social media posts
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{scheduledPosts.length} posts scheduled</span>
        </div>
      </div>

      {/* Posts List */}
      {scheduledPosts.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No scheduled posts
          </h3>
          <p className="text-gray-500">
            Schedule your first post to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div
              key={post.post_id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Platform and content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {platformIcons[post.platform]}
                    <span className="font-semibold text-gray-700">
                      {platformNames[post.platform]}
                    </span>
                    {post.event_title && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {post.event_title}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {truncateText(post.content_preview, 120)}
                  </p>
                </div>

                {/* Right side - Time and actions */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(post.scheduled_time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTimeUntilScheduled(post.scheduled_time)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(post);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelPost(post.post_id, post.platform);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Scheduled Post
                </h3>
                <button
                  onClick={cancelEditing}
                  className="p-2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Edit post content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(editingPost)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {platformIcons[selectedPost.platform]}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {platformNames[selectedPost.platform]} Post Details
                  </h3>
                </div>
                {/* Action buttons on top right */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      startEditing(selectedPost);
                      setSelectedPost(null);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit post"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      handleCancelPost(
                        selectedPost.post_id,
                        selectedPost.platform
                      );
                      setSelectedPost(null);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Platform and Event Info */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Platform:
                  </span>
                  <span className="text-sm text-gray-600">
                    {platformNames[selectedPost.platform]}
                  </span>
                  {selectedPost.event_title && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {selectedPost.event_title}
                      </span>
                    </>
                  )}
                </div>

                {/* Scheduled Time */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Scheduled for:
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDateTime(selectedPost.scheduled_time)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({getTimeUntilScheduled(selectedPost.scheduled_time)})
                  </span>
                </div>

                {/* Campaign Tag */}
                {selectedPost.campaign_tag && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Campaign:
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedPost.campaign_tag}
                    </span>
                  </div>
                )}

                {/* Post Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedPost.content_preview}
                    </p>
                  </div>
                </div>

                {/* Post ID */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Post ID:
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {selectedPost.post_id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ScheduledPosts;
