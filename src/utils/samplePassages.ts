const passages = [
  {
    id: '1',
    text: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet at least once, making it a popular choice for typing tests around the world.',
    difficulty: 'easy',
    category: 'common',
    wordCount: 31,
    charCount: 170,
  },
  {
    id: '2',
    text: 'Programming is not about what you know; it is about what you can figure out. Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.',
    difficulty: 'medium',
    category: 'programming',
    wordCount: 35,
    charCount: 194,
  },
  {
    id: '3',
    text: 'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move. The ships hung in the sky in much the same way that bricks do not.',
    difficulty: 'easy',
    category: 'literature',
    wordCount: 37,
    charCount: 190,
  },
  {
    id: '4',
    text: 'const fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); This recursive function demonstrates the classic Fibonacci sequence calculation, though it lacks optimization through memoization or dynamic programming techniques.',
    difficulty: 'hard',
    category: 'programming',
    wordCount: 33,
    charCount: 237,
  },
  {
    id: '5',
    text: 'The speed of light in vacuum is approximately 299,792,458 meters per second. Einstein showed that nothing with mass can travel at or faster than this speed, fundamentally shaping our understanding of space and time.',
    difficulty: 'medium',
    category: 'science',
    wordCount: 35,
    charCount: 212,
  },
  {
    id: '6',
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light.',
    difficulty: 'medium',
    category: 'literature',
    wordCount: 40,
    charCount: 200,
  },
  {
    id: '7',
    text: 'React hooks let you use state and other features without writing a class. They embrace functions and let you organize the logic inside a component into reusable isolated units called custom hooks.',
    difficulty: 'medium',
    category: 'programming',
    wordCount: 33,
    charCount: 192,
  },
  {
    id: '8',
    text: 'Quantum entanglement occurs when two particles become interconnected, and the quantum state of each particle cannot be described independently. Measuring one particle instantaneously affects the state of the other, regardless of distance.',
    difficulty: 'hard',
    category: 'science',
    wordCount: 32,
    charCount: 228,
  },
];

export function getRandomPassage(difficulty = null) {
  const filtered = difficulty
    ? passages.filter(p => p.difficulty === difficulty)
    : passages;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default passages;
