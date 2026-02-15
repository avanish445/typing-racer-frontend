import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { value: '-', label: 'Active Typists' },
    { value: '-', label: 'Races Completed' },
    { value: '-', label: 'Top WPM Record' },
    { value: '4', label: 'Players Per Room' },
  ]);

  useEffect(() => {
    userService
      .getGlobalStats()
      .then((data) => {
        setStats([
          { value: data.activeTypists || '0', label: 'Active Typists' },
          { value: data.racesCompleted || '0', label: 'Races Completed' },
          { value: data.topWPM || '0', label: 'Top WPM Record' },
          { value: data.maxPlayersPerRoom || '4', label: 'Players Per Room' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time multiplayer typing races
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Race Against
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Real Players
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Compete in real-time typing races with up to 4 players. Track your WPM, accuracy,
              and improvement over time with detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-500/25"
                  >
                    Start Racing Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl text-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Improve
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              From competitive multiplayer races to detailed analytics, TypeRacer has it all.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Test Your Speed?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Join thousands of typists competing in real-time races. Create a room, invite friends, and see who types fastest.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-500/25"
          >
            {user ? 'Go to Dashboard' : 'Get Started Now'}
          </Link>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: '🏎️',
    title: 'Real-Time Multiplayer',
    description: 'Race against up to 4 players simultaneously with live progress tracking and instant results.',
  },
  {
    icon: '📊',
    title: 'Detailed Analytics',
    description: 'Track your WPM trends, accuracy patterns, and most common errors with interactive charts.',
  },
  {
    icon: '🏆',
    title: 'Global Leaderboard',
    description: 'Compete for the top spot on the global leaderboard. See how you rank against the best typists.',
  },
  {
    icon: '⚡',
    title: 'Live Progress Bars',
    description: 'Watch all players race in real-time with animated progress bars and live WPM updates.',
  },
  {
    icon: '🎯',
    title: 'Character-Level Tracking',
    description: 'Every keystroke is tracked with green/red highlighting showing correct and incorrect characters.',
  },
  {
    icon: '🔧',
    title: 'Custom Room Settings',
    description: 'Configure difficulty, duration, and text category. Choose from easy, medium, or hard passages.',
  },
];
