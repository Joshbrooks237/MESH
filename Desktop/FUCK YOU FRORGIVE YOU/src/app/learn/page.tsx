import Link from 'next/link';
import TemperatureIndicator from '@/components/TemperatureIndicator';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-indigo-50">
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
              <Link href="/stories" className="text-gray-600 hover:text-gray-900 transition-colors">Stories</Link>
              <Link href="/learn" className="text-blue-600 font-semibold">Learn</Link>
              <Link href="/meditate" className="text-gray-600 hover:text-gray-900 transition-colors">Meditate</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Understanding Forgiveness
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Science-backed insights about forgiveness, its benefits, and how it transforms lives.
            Knowledge is power on your healing journey.
          </p>
        </div>

        {/* What is Forgiveness */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Forgiveness?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What Forgiveness Is:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">A conscious choice to release resentment</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Letting go of the need for revenge or punishment</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Emotional freedom from past hurts</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">A gift you give yourself</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What Forgiveness Is Not:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Pretending the hurt didn&apos;t happen</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Condoning harmful behavior</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Forgetting the lessons learned</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Requiring reconciliation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">The Science of Forgiveness</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mental Health</h3>
              <p className="text-gray-600">
                Reduces anxiety, depression, and stress. Increases happiness and life satisfaction by up to 20%.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Physical Health</h3>
              <p className="text-gray-600">
                Lowers blood pressure, improves sleep quality, and strengthens immune system function.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relationships</h3>
              <p className="text-gray-600">
                Improves communication, trust, and intimacy. Reduces conflict in current and future relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Research Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Research & Studies</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stanford Forgiveness Project
              </h3>
              <p className="text-gray-600 mb-2">
                A landmark study showing that forgiveness training reduces anger by 50% and increases hope and optimism.
              </p>
              <cite className="text-sm text-gray-500">Fred Luskin, PhD - Stanford University</cite>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mayo Clinic Research
              </h3>
              <p className="text-gray-600 mb-2">
                Forgiveness is linked to lower rates of heart disease, improved immune function, and better mental health outcomes.
              </p>
              <cite className="text-sm text-gray-500">Mayo Clinic Proceedings</cite>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                University of Wisconsin Study
              </h3>
              <p className="text-gray-600 mb-2">
                People who practice forgiveness report 10-15% higher life satisfaction and lower depression rates.
              </p>
              <cite className="text-sm text-gray-500">Journal of Personality and Social Psychology</cite>
            </div>
          </div>
        </div>

        {/* Common Myths */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Myths About Forgiveness</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Myth: &ldquo;Forgiveness means weakness&rdquo;</h3>
                <p className="text-gray-600">
                  <strong>Truth:</strong> Forgiveness requires incredible strength. It takes courage to face pain and choose healing over bitterness.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Myth: &ldquo;I can only forgive if they apologize&rdquo;</h3>
                <p className="text-gray-600">
                  <strong>Truth:</strong> Forgiveness is a personal choice that doesn&apos;t depend on the other person&apos;s actions or remorse.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Myth: &ldquo;Forgiving means forgetting&rdquo;</h3>
                <p className="text-gray-600">
                  <strong>Truth:</strong> Forgiveness acknowledges the hurt while choosing not to let it control your future.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Myth: &ldquo;Forgiveness happens instantly&rdquo;</h3>
                <p className="text-gray-600">
                  <strong>Truth:</strong> Forgiveness is often a process that takes time, patience, and practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Apply What You&apos;ve Learned?</h2>
          <p className="text-xl mb-8 opacity-90">
            Take the knowledge from science and put it into practice with our guided exercises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/exercises"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start an Exercise
            </a>
            <a
              href="/stories"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Read Real Stories
            </a>
          </div>
        </div>
      </main>

      {/* Temperature Indicator */}
      <TemperatureIndicator currentPage="learn" />
    </div>
  );
}
