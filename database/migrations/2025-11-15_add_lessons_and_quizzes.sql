-- SQL: Students Table (for lesson_progress)
CREATE TABLE IF NOT EXISTS students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    tier TEXT CHECK (tier IN ('starter', 'core', 'pro')),
    course_completion INTEGER DEFAULT 0,
    sessions_attended INTEGER DEFAULT 0,
    sessions_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SQL: Course Modules Table (for lessons/quizzes)
CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tier_required TEXT CHECK (tier_required IN ('starter', 'core', 'pro')),
    status TEXT CHECK (status IN ('locked', 'in-progress', 'completed')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- SQL: Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_num INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SQL: Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES course_modules(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[], -- Array of options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SQL: Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);
