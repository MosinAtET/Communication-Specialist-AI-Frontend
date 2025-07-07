export interface SocialMediaPost {
  post_id: string;
  platform: string;
  scheduled_time: string;
  content_preview: string;
  campaign_tag: string;
  event_title?: string;
  status: "Scheduled" | "Published" | "Failed";
}

export interface SocialMediaComment {
  comment_id: string;
  post_id: string;
  platform: string;
  user_name: string;
  comment_text: string;
  classification: string;
  timestamp: string;
  response_status: "Pending" | "Responded" | "Failed";
}

export interface EventDetails {
  event_id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  registration_link?: string;
  is_recorded: string;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  time: string;
  description?: string;
  registration_link?: string;
  is_recorded?: string;
}

export interface UpdateEventRequest {
  title?: string;
  date?: string;
  time?: string;
  description?: string;
  registration_link?: string;
  is_recorded?: string;
}

export interface PlatformStatus {
  platform: string;
  authenticated: boolean;
  status: "connected" | "disconnected" | "error";
}

export interface DashboardStats {
  total_posts: number;
  scheduled_posts: number;
  published_posts: number;
  total_comments: number;
  pending_comments: number;
  total_events: number;
}

export interface AIResponse {
  ResponseID: string;
  TriggerType: string;
  KeywordMatch: string;
  ResponseText: string;
}
