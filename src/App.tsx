import { useEffect, useState } from 'react';
import Header from './components/Header';
import TopicFilter from './components/TopicFilter';
import QuestionCard from './components/QuestionCard';
import StatsPanel from './components/StatsPanel';
import { Topic, Question, getTopics, getQuestions, generateSessionId } from './lib/supabase';
import { AlertCircle, BookOpen } from 'lucide-react';

export default function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    totalScore: 0,
    totalMarks: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedTopic]);

  const loadData = async () => {
    try {
      setLoading(true);
      const topicsData = await getTopics();
      setTopics(topicsData);
      await loadQuestions();
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const questionsData = await getQuestions(selectedTopic || undefined);
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to load questions.');
      console.error(err);
    }
  };

  const handleAnswered = (marksAwarded: number, marksAvailable: number) => {
    setStats((prev) => ({
      questionsAnswered: prev.questionsAnswered + 1,
      totalScore: prev.totalScore + marksAwarded,
      totalMarks: prev.totalMarks + marksAvailable,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Loading questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header totalScore={stats.totalScore} totalMarks={stats.totalMarks} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <StatsPanel
            questionsAnswered={stats.questionsAnswered}
            totalScore={stats.totalScore}
            totalMarks={stats.totalMarks}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TopicFilter
              topics={topics}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
            />
          </div>

          <div className="lg:col-span-3">
            {questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Questions Available</h3>
                <p className="text-gray-500">
                  {selectedTopic
                    ? 'No questions found for this topic. Try selecting a different topic.'
                    : 'No questions available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {questions.length} Question{questions.length !== 1 ? 's' : ''} Available
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Answer each question and receive instant AI-powered feedback based on the OCR J277 mark scheme.
                  </p>
                </div>

                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    sessionId={sessionId}
                    onAnswered={handleAnswered}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              GCSE Computer Science OCR J277 Higher Tier Practice System
            </p>
            <p className="text-xs text-gray-500">
              AI-powered marking provides instant feedback based on official mark schemes.
              Results are indicative and should be used for practice purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
