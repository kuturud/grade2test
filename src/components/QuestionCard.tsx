import { useState } from 'react';
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Question, submitAnswer } from '../lib/supabase';

interface QuestionCardProps {
  question: Question;
  sessionId: string;
  onAnswered: (marksAwarded: number, marksAvailable: number) => void;
}

export default function QuestionCard({ question, sessionId, onAnswered }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    marksAwarded: number;
    feedback: string;
  } | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await submitAnswer(
        question.id,
        answer,
        question.question_text,
        question.mark_scheme,
        question.marks_available,
        sessionId
      );

      if (response.success) {
        setResult({
          marksAwarded: response.marksAwarded,
          feedback: response.feedback,
        });
        onAnswered(response.marksAwarded, question.marks_available);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentage = result
    ? Math.round((result.marksAwarded / question.marks_available) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {question.marks_available} mark{question.marks_available !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed">{question.question_text}</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`answer-${question.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                id={`answer-${question.id}`}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Type your answer here..."
                disabled={isSubmitting}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
              <div className="font-medium text-gray-700 mb-2">Your Answer:</div>
              <div className="text-gray-600 whitespace-pre-wrap">{answer}</div>
            </div>

            <div className={`rounded-lg p-6 ${percentage >= 75 ? 'bg-green-50' : percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                {percentage >= 75 ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {result.marksAwarded}/{question.marks_available} marks
                  </div>
                  <div className="text-sm text-gray-600">({percentage}%)</div>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="font-medium text-gray-700 mb-2">Feedback:</div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{result.feedback}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
