import { BookOpen, Award } from 'lucide-react';

interface HeaderProps {
  totalScore: number;
  totalMarks: number;
}

export default function Header({ totalScore, totalMarks }: HeaderProps) {
  const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  return (
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">GCSE Computer Science</h1>
              <p className="text-blue-100 text-sm">OCR J277 Higher Tier Practice</p>
            </div>
          </div>

          {totalMarks > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3">
              <Award className="w-6 h-6" />
              <div>
                <div className="text-sm text-blue-100">Your Score</div>
                <div className="text-2xl font-bold">
                  {totalScore}/{totalMarks} <span className="text-lg">({percentage}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
