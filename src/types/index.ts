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
  EventID: string;
  Title: string;
  Date: string;
  Time: string;
  Description: string;
  RegistrationLink: string;
  IsRecorded: string;
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
