import { TrendingUp, Target, Award } from 'lucide-react';

interface StatsPanelProps {
  questionsAnswered: number;
  totalScore: number;
  totalMarks: number;
}

export default function StatsPanel({ questionsAnswered, totalScore, totalMarks }: StatsPanelProps) {
  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A*';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'U';
  };

  const grade = getGrade(percentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6" />
          <div className="text-sm font-medium opacity-90">Questions Answered</div>
        </div>
        <div className="text-4xl font-bold">{questionsAnswered}</div>
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6" />
          <div className="text-sm font-medium opacity-90">Total Score</div>
        </div>
        <div className="text-4xl font-bold">
          {totalScore}/{totalMarks}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <div className="text-sm font-medium opacity-90">Current Grade</div>
        </div>
        <div className="text-4xl font-bold">{totalMarks > 0 ? grade : '-'}</div>
        {totalMarks > 0 && <div className="text-sm opacity-90 mt-1">{percentage}%</div>}
      </div>
    </div>
  );
}
