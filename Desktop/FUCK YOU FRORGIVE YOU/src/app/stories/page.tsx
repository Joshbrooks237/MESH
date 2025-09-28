'use client';

import { useState } from 'react';
import Link from 'next/link';
import TemperatureIndicator from '@/components/TemperatureIndicator';

interface Story {
  id: string;
  content: string;
  timestamp: Date;
  category: string;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      content: "After years of holding onto anger toward my father for abandoning our family, I finally wrote him a letter I never sent. In it, I acknowledged my pain but also recognized that he was dealing with his own demons. I'm not saying what he did was okay, but I can see how his own hurt led him to hurt others. For the first time in years, I feel a weight lifting from my shoulders.",
      timestamp: new Date('2024-09-20'),
      category: 'Family'
    },
    {
      id: '2',
      content: "My best friend betrayed my trust by sharing a personal secret I'd told her in confidence. It destroyed our friendship and left me feeling exposed and vulnerable. Through the forgiveness exercises here, I realized that her actions said more about her insecurities than about my worth. I don't think we'll ever be friends again, but I no longer carry the resentment that was poisoning my other relationships.",
      timestamp: new Date('2024-09-18'),
      category: 'Friendship'
    },
    {
      id: '3',
      content: "I spent a decade angry at my ex-partner for cheating and leaving me during my darkest time. Recently, I learned about the abuse they suffered as a child. While it doesn't excuse their behavior toward me, it helps me understand that pain can create cycles. Choosing forgiveness doesn't mean I want them back - it means I'm breaking the cycle for myself and any future relationships.",
      timestamp: new Date('2024-09-15'),
      category: 'Relationships'
    }
  ]);

  const [showShareForm, setShowShareForm] = useState(false);
  const [newStory, setNewStory] = useState('');
  const [category, setCategory] = useState('General');

  const categories = ['General', 'Family', 'Friendship', 'Relationships', 'Work', 'Community', 'Self'];

  const handleShareStory = () => {
    if (newStory.trim()) {
      const story: Story = {
        id: Date.now().toString(),
        content: newStory.trim(),
        timestamp: new Date(),
        category: category
      };
      setStories([story, ...stories]);
      setNewStory('');
      setShowShareForm(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">ForgiveForward</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/exercises" className="text-gray-600 hover:text-gray-900 transition-colors">Exercises</Link>
              <Link href="/stories" className="text-blue-600 font-semibold">Stories</Link>
              <Link href="/learn" className="text-gray-600 hover:text-gray-900 transition-colors">Learn</Link>
              <Link href="/meditate" className="text-gray-600 hover:text-gray-900 transition-colors">Meditate</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Truth Circles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Anonymous stories of hurt, healing, and hope. Share your experience or find connection
            in others&apos; journeys toward forgiveness.
          </p>
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Share Your Story Anonymously
          </button>
        </div>

        {/* Share Form */}
        {showShareForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Share Your Story</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story
                </label>
                <textarea
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  placeholder="Share your experience with hurt, forgiveness, or healing. Your story will be posted anonymously..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <div className="mt-1 text-sm text-gray-500 text-right">
                  {newStory.length}/1000 characters
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShareForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareStory}
                  disabled={!newStory.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Share Anonymously
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>✨ Your story will be shared anonymously. No personal information is collected.</p>
              <p>💜 All stories are moderated for safety and respect.</p>
            </div>
          </div>
        )}

        {/* Stories Feed */}
        <div className="space-y-8">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {story.category}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(story.timestamp)}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {story.content}
              </p>
              <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>This helped me</span>
                </button>
                <span>•</span>
                <span>Anonymous</span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all">
            Load More Stories
          </button>
        </div>

        {/* Community Guidelines */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-medium mb-2">What We Encourage:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Honest sharing of personal experiences</li>
                <li>• Stories of growth and healing</li>
                <li>• Questions about forgiveness</li>
                <li>• Support for others on their journey</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">What We Don&apos;t Allow:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Harmful or abusive content</li>
                <li>• Personal attacks or doxxing</li>
                <li>• Spam or irrelevant content</li>
                <li>• Solicitations or promotions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Temperature Indicator */}
      <TemperatureIndicator currentPage="stories" />
    </div>
  );
}
