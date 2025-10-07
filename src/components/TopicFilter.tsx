import { Topic } from '../lib/supabase';

interface TopicFilterProps {
  topics: Topic[];
  selectedTopic: string | null;
  onSelectTopic: (topicId: string | null) => void;
}

export default function TopicFilter({ topics, selectedTopic, onSelectTopic }: TopicFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter by Topic</h2>
      <div className="space-y-2">
        <button
          onClick={() => onSelectTopic(null)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
            selectedTopic === null
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="font-medium">All Topics</div>
        </button>

        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              selectedTopic === topic.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{topic.name}</div>
            <div className={`text-sm mt-1 ${selectedTopic === topic.id ? 'text-blue-100' : 'text-gray-500'}`}>
              {topic.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
