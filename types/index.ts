export type QuestionCategory =
  | "behavioral"
  | "technical"
  | "situational"
  | "leadership"
  | "problem_solving";

export type ResponseType = "text" | "video";

export interface Question {
  id: string;
  user_id: string;
  text: string;
  category: QuestionCategory;
  is_default: boolean;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  user_id: string;
  question_id: string;
  served_date: string;
  responded: boolean;
  question?: Question;
}

export interface UserResponse {
  id: string;
  user_id: string;
  question_id: string;
  response_type: ResponseType;
  text_content: string | null;
  video_url: string | null;
  transcript: string | null;
  duration_seconds: number | null;
  created_at: string;
  question?: Question;
  analysis?: Analysis;
}

export interface ContentAnalysis {
  relevance_score: number;
  structure_score: number;
  depth_score: number;
  example_usage_score: number;
  summary: string;
}

export interface DeliveryAnalysis {
  eye_contact_score: number;
  body_language_score: number;
  confidence_score: number;
  pace_score: number;
  filler_word_count: number;
  filler_words_detected: string[];
  wpm: number;
  estimated_pauses: number;
  summary: string;
}

export interface Analysis {
  id: string;
  response_id: string;
  overall_score: number;
  content_analysis: ContentAnalysis;
  delivery_analysis: DeliveryAnalysis | null;
  suggestions: string[];
  strengths: string[];
  improved_response: string;
  raw_json: Record<string, unknown>;
  created_at: string;
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  "behavioral",
  "technical",
  "situational",
  "leadership",
  "problem_solving",
];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  situational: "Situational",
  leadership: "Leadership",
  problem_solving: "Problem Solving",
};
