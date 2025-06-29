import React, { useState } from "react";
import { schedulePost } from "../services/api";
import {
  Twitter,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Clock,
  Calendar,
  X,
  Save,
} from "lucide-react";

const platformOptions = [
  {
    value: "devto",
    label: "Dev.to",
    icon: <Globe className="w-5 h-5 text-blue-500" />,
  },
  {
    value: "twitter",
    label: "Twitter",
    icon: <Twitter className="w-5 h-5 text-sky-400" />,
  },
];

const platformIcons: Record<string, React.ReactNode> = {
  devto: <Globe className="w-4 h-4 text-blue-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
};

const platformNames: Record<string, string> = {
  devto: "Dev.to",
  twitter: "Twitter",
};

const MAX_PROMPT_LENGTH = 500;

interface ScheduledPost {
  post_id: string;
  content: string;
  scheduled_time: string;
}

interface SchedulePostResult {
  success?: boolean;
  immediate?: boolean;
  message?: string;
  scheduled_posts?: Record<string, ScheduledPost>;
  event?: {
    title?: string;
    date?: string;
    description?: string;
  };
  event_matching?: {
    matched_event_title?: string;
    confidence?: number;
    reasoning?: string;
  };
}

const SchedulePost: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["devto"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchedulePostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTime, setEditTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await schedulePost(prompt, platforms);
      setResult(data);
      showToast("Post scheduled successfully", "success");
      setPrompt("");
    } catch (err) {
      setError("Failed to schedule post");
      showToast("Failed to schedule post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlatforms((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((p) => p !== value)
    );
  };

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startEditing = (post: ScheduledPost) => {
    setEditingPost(post.post_id);
    setEditContent(post.content);
    const date = new Date(post.scheduled_time);
    const localDateTime = date.toISOString().slice(0, 16);
    setEditTime(localDateTime);
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditContent("");
    setEditTime("");
  };

  const saveEdit = async (_postId: string) => {
    // This would need to be implemented with the edit API
    showToast(
      "Edit functionality will be available in the Scheduled Posts page",
      "info"
    );
    cancelEditing();
  };

  const handleDelete = async (_postId: string, _platform: string) => {
    // This would need to be implemented with the delete API
    showToast(
      "Delete functionality will be available in the Scheduled Posts page",
      "info"
    );
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

  const resetForm = () => {
    setResult(null);
    setError(null);
    setPrompt("");
    setPlatforms(["devto"]);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {!result?.success ? (
          // Schedule Form
          <>
            <h1 className="text-3xl font-extrabold text-primary-700 mb-6 flex items-center gap-2">
              <span role="img" aria-label="calendar">
                📝
              </span>{" "}
              Schedule a Post
            </h1>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to post?
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your post and when to schedule it... (e.g., 'Post immediately about our July Webinar', 'Schedule a post about today\'s AI conference for 8:18 AM', 'Post now about the React workshop')"
                  maxLength={MAX_PROMPT_LENGTH}
                  required
                />
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Max {MAX_PROMPT_LENGTH} characters</span>
                  <span>
                    {prompt.length}/{MAX_PROMPT_LENGTH}
                  </span>
                </div>
              </div>
              {/* Step 2: Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you want to post?
                </label>
                <div className="flex gap-6 mt-2">
                  {platformOptions.map((platform) => (
                    <label
                      key={platform.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition cursor-pointer ${
                        platforms.includes(platform.value)
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-primary-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={platform.value}
                        checked={platforms.includes(platform.value)}
                        onChange={handlePlatformChange}
                        className="accent-blue-600"
                      />
                      {platform.icon}
                      <span className="font-medium text-gray-700">
                        {platform.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Step 3: Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Summary
                </h2>
                <div className="text-gray-700 text-sm">
                  <div>
                    <span className="font-semibold">Prompt:</span>{" "}
                    {prompt || (
                      <span className="italic text-gray-400">(none)</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">Platforms:</span>{" "}
                    {platforms.length > 0 ? (
                      platforms.join(", ")
                    ) : (
                      <span className="italic text-gray-400">(none)</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || !prompt || platforms.length === 0}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}{" "}
                {loading ? "Scheduling..." : "Schedule Post"}
              </button>
            </form>
          </>
        ) : (
          // Success Result
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold text-primary-700 flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                Posts Scheduled Successfully!
              </h1>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <span>Schedule Another</span>
              </button>
            </div>

            {/* Event Information */}
            {result.event && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Matched Event
                </h3>
                <div className="text-blue-700">
                  <div className="font-medium">{result.event.title}</div>
                  {result.event.date && (
                    <div className="text-sm mt-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {formatDateTime(result.event.date)}
                    </div>
                  )}
                  {result.event.description && (
                    <div className="text-sm mt-2">
                      {result.event.description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scheduled Posts */}
            {result.scheduled_posts &&
              Object.keys(result.scheduled_posts).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Your Scheduled Posts
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(result.scheduled_posts).map(
                      ([platform, post]) => (
                        <div
                          key={post.post_id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          {editingPost === post.post_id ? (
                            // Edit Mode
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {platformIcons[platform]}
                                  <span className="font-semibold text-gray-700">
                                    {platformNames[platform]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => saveEdit(post.post_id)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                  >
                                    <Save className="w-4 h-4" />
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Edit post content..."
                              />
                              <input
                                type="datetime-local"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                          ) : (
                            // View Mode
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  {platformIcons[platform]}
                                  <span className="font-semibold text-gray-700">
                                    {platformNames[platform]}
                                  </span>
                                  {result.immediate && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Immediate
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEditing(post)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDelete(post.post_id, platform)
                                    }
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="mb-4">
                                <p className="text-gray-800 leading-relaxed">
                                  {post.content}
                                </p>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    Scheduled for:{" "}
                                    {formatDateTime(post.scheduled_time)}
                                  </span>
                                </div>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  ID: {post.post_id}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800 mb-1">
                    {result.immediate
                      ? "Posts Scheduled for Immediate Publishing!"
                      : "Posts Scheduled Successfully!"}
                  </div>
                  <div className="text-sm text-green-700">
                    {result.message ||
                      "Your posts have been scheduled successfully."}
                  </div>
                  {result.event_matching && (
                    <div className="text-sm text-green-700 mt-2">
                      <div className="font-medium">
                        📅 Event Match Confidence:{" "}
                        {(
                          (result.event_matching.confidence ?? 0) * 100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {result.event_matching.reasoning}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <div className="font-semibold text-red-800 mb-1">Error</div>
              <div className="text-sm text-red-700">{error}</div>
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
    </div>
  );
};

export default SchedulePost;
