import axios from "axios";
import type {
  SocialMediaPost,
  SocialMediaComment,
  EventDetails,
  PlatformStatus,
  DashboardStats,
  AIResponse,
  CreateEventRequest,
  UpdateEventRequest,
} from "../types";

const API_BASE_URL =
  "https://et-ci-dev-csai-api-dnaaecbnajbab5fc.centralindia-01.azurewebsites.net/";

// const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/stats");
  return response.data;
};

// Social Media Posts
export const getScheduledPosts = async (): Promise<SocialMediaPost[]> => {
  const response = await api.get("/scheduled-posts");
  return response.data;
};

export const schedulePost = async (prompt: string, platforms: string[]) => {
  const response = await fetch(`${API_BASE_URL}/schedule-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, platforms }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to schedule post");
  }

  return response.json();
};

export const editScheduledPost = async (
  postId: string,
  newContent?: string,
  newTime?: string
) => {
  const response = await fetch(`${API_BASE_URL}/scheduled-posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_content: newContent,
      new_time: newTime,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to edit post");
  }

  return response.json();
};

export const cancelScheduledPost = async (postId: string, platform: string) => {
  const response = await fetch(
    `${API_BASE_URL}/scheduled-posts/${postId}?platform=${platform}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to cancel post");
  }

  return response.json();
};

// Comments
export const getPendingComments = async (): Promise<SocialMediaComment[]> => {
  const response = await api.get("/pending-comments");
  return response.data;
};

export const respondToComment = async (
  commentId: string,
  response: string
): Promise<any> => {
  const apiResponse = await api.post(`/comments/${commentId}/respond`, {
    response_text: response,
  });
  return apiResponse.data;
};

// Events
export const getEvents = async (): Promise<EventDetails[]> => {
  const response = await api.get("/events");
  return response.data;
};

export const getEvent = async (eventId: string): Promise<EventDetails> => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const createEvent = async (
  event: CreateEventRequest
): Promise<EventDetails> => {
  const response = await api.post("/events", event);
  return response.data;
};

export const updateEvent = async (
  eventId: string,
  event: UpdateEventRequest
): Promise<EventDetails> => {
  const response = await api.put(`/events/${eventId}`, event);
  return response.data;
};

export const deleteEvent = async (
  eventId: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

// Platform Status
export const getPlatformStatus = async (): Promise<PlatformStatus[]> => {
  // Endpoint does not exist in backend, return empty array or handle gracefully
  return [];
};

// AI Responses
export const getAIResponses = async (): Promise<AIResponse[]> => {
  const response = await api.get("/ai-responses");
  return response.data;
};

export const createAIResponse = async (
  aiResponse: Omit<AIResponse, "ResponseID">
): Promise<AIResponse> => {
  const response = await api.post("/ai-responses", aiResponse);
  return response.data;
};

// Manual Comment Monitoring
export const runCommentMonitor = async (
  postId: string,
  platform: string,
  platformPostId: string
): Promise<any> => {
  const response = await api.post("/monitor/comments", {
    post_id: postId,
    platform: platform,
    platform_post_id: platformPostId,
  });
  return response.data;
};

export default api;
