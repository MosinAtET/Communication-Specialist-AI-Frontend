import React, { useEffect, useState } from "react";
import { getPendingComments, respondToComment } from "../services/api";
import {
  MessageSquare,
  Clock,
  Globe,
  Twitter,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Bot,
} from "lucide-react";

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
  devto: <Globe className="w-4 h-4 text-blue-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-400" />,
};

const platformNames: Record<string, string> = {
  devto: "Dev.to",
  twitter: "Twitter",
};

const classificationColors: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-800",
  question: "bg-blue-100 text-blue-800",
  spam: "bg-yellow-100 text-yellow-800",
};

const PendingComments: React.FC = () => {
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  useEffect(() => {
    loadPendingComments();
    const interval = setInterval(loadPendingComments, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingComments = async () => {
    setLoading(true);
    try {
      const data = await getPendingComments();
      setPendingComments(data);
    } catch {
      setPendingComments([]);
      showToast("Error loading pending comments", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const startResponding = (commentId: string) => {
    setRespondingTo(commentId);
    setResponseText("");
  };

  const cancelResponding = () => {
    setRespondingTo(null);
    setResponseText("");
  };

  const handleRespond = async (commentId: string) => {
    if (!responseText.trim()) {
      showToast("Please enter a response", "error");
      return;
    }

    try {
      await respondToComment(commentId, responseText);
      showToast("Response sent successfully", "success");
      cancelResponding();
      loadPendingComments(); // Refresh to remove responded comment
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send response";
      showToast(errorMessage, "error");
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
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

  const getClassificationIcon = (classification: string) => {
    switch (classification.toLowerCase()) {
      case "positive":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "negative":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "question":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
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
            Pending Comments
          </h2>
          <p className="text-gray-500">
            Review and respond to comments that need attention
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span>{pendingComments.length} comments pending</span>
        </div>
      </div>

      {/* Comments List */}
      {pendingComments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending comments
          </h3>
          <p className="text-gray-500">
            All comments have been reviewed and responded to.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingComments.map((comment) => (
            <div
              key={comment.comment_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {respondingTo === comment.comment_id ? (
                // Response Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        Responding to {comment.user_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(comment.comment_id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Send className="w-4 h-4" />
                        Send Response
                      </button>
                      <button
                        onClick={cancelResponding}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Type your response..."
                  />
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {platformIcons[comment.platform]}
                      <span className="font-semibold text-gray-700">
                        {platformNames[comment.platform]}
                      </span>
                      <div className="flex items-center gap-2">
                        {getClassificationIcon(comment.classification)}
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            classificationColors[
                              comment.classification.toLowerCase()
                            ] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {comment.classification}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => startResponding(comment.comment_id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Bot className="w-4 h-4" />
                      Respond
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {comment.user_name}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-gray-800 leading-relaxed">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Posted: {formatDateTime(comment.timestamp)}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Post ID: {comment.post_id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
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

export default PendingComments;
