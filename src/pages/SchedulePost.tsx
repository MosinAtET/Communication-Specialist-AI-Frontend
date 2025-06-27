import React, { useState } from "react";
import { schedulePost } from "../services/api";
import {
  Twitter,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
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

const MAX_PROMPT_LENGTH = 500;

// Define a type for the result object
interface SchedulePostResult {
  success?: boolean;
  immediate?: boolean;
  message?: string;
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12">
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
                {prompt || <span className="italic text-gray-400">(none)</span>}
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
        {/* Feedback */}
        {result && result.success && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold text-green-800 mb-1">
                {result.immediate
                  ? "Post Scheduled for Immediate Publishing!"
                  : "Post Scheduled!"}
              </div>
              <div className="text-sm text-green-700 mb-2">
                {result.message || "Your post has been scheduled successfully."}
              </div>
              {result.event_matching && (
                <div className="text-sm text-green-700 mb-2">
                  <div className="font-medium">
                    📅 Matched Event:{" "}
                    {result.event_matching.matched_event_title}
                  </div>
                  {result.event_matching.confidence !== undefined && (
                    <div className="text-xs text-green-600">
                      Confidence:{" "}
                      {((result.event_matching.confidence ?? 0) * 100).toFixed(
                        0
                      )}
                      % • {result.event_matching.reasoning}
                    </div>
                  )}
                </div>
              )}
              {result.immediate && (
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  ⚡ Post will be published within 2 minutes
                </div>
              )}
              <details className="mt-3">
                <summary className="text-xs text-green-600 cursor-pointer hover:text-green-700">
                  View Details
                </summary>
                <pre className="text-xs text-green-900 overflow-x-auto whitespace-pre-wrap mt-2 bg-green-100 p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>
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

export default SchedulePost;
