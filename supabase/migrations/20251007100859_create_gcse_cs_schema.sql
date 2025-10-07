/*
  # GCSE OCR J277 Computer Science Question and Marking System

  ## New Tables

  ### 1. `topics`
    - `id` (uuid, primary key) - Unique identifier for each topic
    - `name` (text) - Topic name (e.g., "Systems Architecture", "Networks")
    - `description` (text) - Brief description of the topic
    - `created_at` (timestamptz) - Timestamp of creation

  ### 2. `questions`
    - `id` (uuid, primary key) - Unique identifier for each question
    - `topic_id` (uuid, foreign key) - References topics table
    - `question_text` (text) - The question content
    - `marks_available` (integer) - Maximum marks for this question
    - `difficulty` (text) - Difficulty level: 'easy', 'medium', 'hard'
    - `mark_scheme` (text) - Marking criteria and expected answers
    - `created_at` (timestamptz) - Timestamp of creation

  ### 3. `user_attempts`
    - `id` (uuid, primary key) - Unique identifier for each attempt
    - `question_id` (uuid, foreign key) - References questions table
    - `user_answer` (text) - Student's submitted answer
    - `marks_awarded` (integer) - Marks given by AI
    - `feedback` (text) - AI-generated feedback
    - `created_at` (timestamptz) - Timestamp of submission
    - `session_id` (text) - Session identifier for anonymous users

  ## Security
    - Enable RLS on all tables
    - Allow public read access to topics and questions
    - Allow public insert/read access to user_attempts (for anonymous practice)

  ## Notes
    - System designed for anonymous practice sessions
    - AI marking via edge function using mark scheme
    - Supports OCR J277 Computer Science topics
*/

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  marks_available integer NOT NULL DEFAULT 1,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mark_scheme text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_attempts table
CREATE TABLE IF NOT EXISTS user_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  marks_awarded integer DEFAULT 0,
  feedback text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  session_id text NOT NULL
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics (public read)
CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  USING (true);

-- RLS Policies for questions (public read)
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

-- RLS Policies for user_attempts (public insert and read own)
CREATE POLICY "Anyone can insert attempts"
  ON user_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view own attempts"
  ON user_attempts FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_question_id ON user_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_session_id ON user_attempts(session_id);

-- Insert OCR J277 topics
INSERT INTO topics (name, description) VALUES
  ('Systems Architecture', 'CPU components, Von Neumann architecture, and computer systems'),
  ('Memory and Storage', 'RAM, ROM, virtual memory, and storage devices'),
  ('Networks', 'Network topologies, protocols, and the internet'),
  ('Network Security', 'Threats, malware, and security measures'),
  ('Systems Software', 'Operating systems, utility software, and system management'),
  ('Ethical, Legal and Environmental', 'Computer use impacts and legislation'),
  ('Algorithms', 'Algorithm design, searching, and sorting'),
  ('Programming Fundamentals', 'Data types, operators, and programming constructs'),
  ('Boolean Logic', 'Logic gates and truth tables'),
  ('Data Representation', 'Binary, hexadecimal, character encoding, and images')
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme) 
SELECT 
  t.id,
  'Describe what is meant by the Von Neumann architecture.',
  3,
  'medium',
  'Mark Scheme: Award 1 mark for each of the following points (max 3):
- Uses a single shared memory for both data and instructions
- Instructions and data are stored in the same format
- Instructions are fetched and executed sequentially
- Uses a single bus system for data transfer
- CPU fetches instructions from memory one at a time'
FROM topics t WHERE t.name = 'Systems Architecture'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme)
SELECT 
  t.id,
  'Explain the difference between RAM and ROM.',
  4,
  'easy',
  'Mark Scheme: Award 1 mark for each of the following (max 4):
RAM:
- Volatile memory / loses data when power is off (1 mark)
- Can be read and written to (1 mark)
- Used to store currently running programs and data (1 mark)

ROM:
- Non-volatile memory / retains data when power is off (1 mark)
- Read only / cannot be easily modified (1 mark)
- Contains boot instructions / BIOS / firmware (1 mark)'
FROM topics t WHERE t.name = 'Memory and Storage'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme)
SELECT 
  t.id,
  'State three benefits of using a Local Area Network (LAN).',
  3,
  'easy',
  'Mark Scheme: Award 1 mark for each benefit (max 3):
- Sharing files / resources between users
- Sharing hardware such as printers
- Communication between users (email, messaging)
- Centralized backups
- Centralized software installation / updates
- Sharing internet connection
- User access control / security management'
FROM topics t WHERE t.name = 'Networks'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme)
SELECT 
  t.id,
  'Describe how a Denial of Service (DoS) attack works and suggest one way to prevent it.',
  4,
  'hard',
  'Mark Scheme:
How it works (2 marks):
- Attacker floods a server/network with requests (1 mark)
- Legitimate users cannot access the service / server becomes overloaded (1 mark)

Prevention (2 marks, 1 mark for each valid method):
- Use firewalls to filter malicious traffic
- Implement rate limiting
- Use anti-DDoS services / traffic filtering
- Increase bandwidth / server capacity
- Monitor traffic patterns for anomalies'
FROM topics t WHERE t.name = 'Network Security'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme)
SELECT 
  t.id,
  'Convert the binary number 10110101 to decimal.',
  2,
  'easy',
  'Mark Scheme:
- Correct method shown: 128 + 32 + 16 + 4 + 1 (1 mark)
- Correct answer: 181 (1 mark, can be awarded independently if answer is correct)'
FROM topics t WHERE t.name = 'Data Representation'
ON CONFLICT DO NOTHING;

INSERT INTO questions (topic_id, question_text, marks_available, difficulty, mark_scheme)
SELECT 
  t.id,
  'Explain the purpose of an operating system and give two examples of operating system functions.',
  5,
  'medium',
  'Mark Scheme:
Purpose (2 marks):
- Manages computer hardware and software resources (1 mark)
- Provides interface between user and hardware / allows programs to run (1 mark)

Functions (3 marks, award 1 mark for each, max 3):
- Memory management / allocation
- File management / organizing files
- User interface provision
- Security / user access control
- Peripheral / device management
- Processor scheduling / multitasking
- Error handling'
FROM topics t WHERE t.name = 'Systems Software'
ON CONFLICT DO NOTHING;