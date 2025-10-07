import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Topic {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  marks_available: number;
  difficulty: 'easy' | 'medium' | 'hard';
  mark_scheme: string;
  created_at: string;
}

export interface UserAttempt {
  id: string;
  question_id: string;
  user_answer: string;
  marks_awarded: number;
  feedback: string;
  created_at: string;
  session_id: string;
}

export interface MarkingResponse {
  success: boolean;
  marksAwarded: number;
  feedback: string;
  error?: string;
}

export async function getTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getQuestions(topicId?: string): Promise<Question[]> {
  let query = supabase.from('questions').select('*');

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data, error } = await query.order('created_at');

  if (error) throw error;
  return data || [];
}

export async function submitAnswer(
  questionId: string,
  userAnswer: string,
  questionText: string,
  markScheme: string,
  marksAvailable: number,
  sessionId: string
): Promise<MarkingResponse> {
  const apiUrl = `${supabaseUrl}/functions/v1/mark-answer`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAnswer,
      markScheme,
      marksAvailable,
      questionText,
    }),
  });

  const result: MarkingResponse = await response.json();

  if (result.success) {
    const { error } = await supabase.from('user_attempts').insert({
      question_id: questionId,
      user_answer: userAnswer,
      marks_awarded: result.marksAwarded,
      feedback: result.feedback,
      session_id: sessionId,
    });

    if (error) throw error;
  }

  return result;
}

export async function getUserAttempts(sessionId: string): Promise<UserAttempt[]> {
  const { data, error } = await supabase
    .from('user_attempts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
