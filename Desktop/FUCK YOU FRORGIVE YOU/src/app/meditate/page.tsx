'use client';

import { useState } from 'react';
import Link from 'next/link';
import TemperatureIndicator from '@/components/TemperatureIndicator';

interface Meditation {
  id: string;
  title: string;
  duration: string;
  description: string;
  category: string;
  audioUrl?: string;
  script: string[];
}

export default function MeditatePage() {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [currentScriptStep, setCurrentScriptStep] = useState(0);

  const meditations: Meditation[] = [
    {
      id: '1',
      title: 'Releasing Resentment',
      duration: '10 minutes',
      description: 'A guided meditation to help release deep-seated resentment and anger, creating space for peace.',
      category: 'Forgiveness',
      script: [
        "Find a comfortable seated position. Close your eyes gently and take a few deep breaths, remembering that your breath is a gift...",
        "Become aware of your body as a temple. Notice any tension or tightness that might be holding onto resentment...",
        "Bring to mind the person or situation that has caused you pain. Hold them in your heart without judgment...",
        "Remember the ancient wisdom: 'If you hold onto anger, you will hand yourself over to your enemies'...",
        "Imagine this resentment as a heavy burden you're carrying. Feel how it weighs down your spirit...",
        "Now, visualize yourself gently setting this burden down at the feet of the Divine, choosing the path of freedom...",
        "Breathe in peace that passes understanding. Breathe out the resentment. With each exhale, let a little more go...",
        "Imagine divine light and mercy filling the space where resentment once lived. Feel healing beginning to flow...",
        "When you're ready, slowly open your eyes. Carry this sense of release and the strength of forgiveness with you..."
      ]
    },
    {
      id: '2',
      title: 'Self-Compassion Practice',
      duration: '15 minutes',
      description: 'Cultivate kindness toward yourself as you work through forgiveness and healing.',
      category: 'Self-Care',
      script: [
        "Settle into a comfortable position. Close your eyes and take three slow, deep breaths, remembering you are fearfully and wonderfully made...",
        "Place one hand on your heart. Feel the warmth of your own touch, honoring the divine spark within you...",
        "Think of a time when you were hurt. Notice any self-criticism that arises, remembering that judgment belongs to One greater than us...",
        "Now, speak to yourself with the compassion of a shepherd: 'This is painful, and it's okay to feel this way...'",
        "Acknowledge your strength: 'I have been carried through this valley, and healing is my portion...'",
        "Offer yourself divine compassion: 'May I be patient with myself in this moment. May I extend mercy as I have received mercy...'",
        "Breathe in the loving-kindness of the Creator. Breathe out self-judgment. Repeat these ancient blessings silently...",
        "End by giving thanks for your courage and the divine strength that sustains you. Open your eyes when ready..."
      ]
    },
    {
      id: '3',
      title: 'Loving-Kindness for Difficult People',
      duration: '12 minutes',
      description: 'Send loving-kindness to those who have hurt you, fostering understanding and compassion.',
      category: 'Compassion',
      script: [
        "Find your comfortable posture. Close your eyes and settle into your breath, remembering the commandment to love your neighbor...",
        "Begin by blessing yourself: 'May I walk in divine favor. May I be strengthened. May I dwell in peace...'",
        "Think of someone you care about deeply. Send them the same blessing: 'May you walk in divine favor. May you be strengthened. May you dwell in peace...'",
        "Now, bring to mind the person who has hurt you. Remember the wisdom: 'If your enemy is hungry, feed him...'",
        "Silently pray for them: 'May you find your way to peace. May you be touched by mercy. May healing come to your heart...'",
        "If this feels difficult, remember that blessing others doesn't mean condoning harm. It reflects the divine nature within us...",
        "Notice any emotions that arise. Breathe through them with the patience of the psalmist...",
        "End by returning to yourself: 'May I walk in divine favor. May I be strengthened. May I dwell in peace...'",
        "Open your eyes, carrying this spirit of blessing and the wisdom of loving your enemies..."
      ]
    },
    {
      id: '4',
      title: 'Breath of Forgiveness',
      duration: '8 minutes',
      description: 'Simple breathing exercises paired with forgiveness affirmations for quick emotional relief.',
      category: 'Breathing',
      script: [
        "Sit comfortably with your spine straight. Place your hands on your belly, honoring your body as a divine creation...",
        "Take a slow breath in through your nose for a count of 4, breathing in the breath of life...",
        "Hold for a count of 4, feeling the divine presence...",
        "Exhale slowly through your mouth for a count of 6, releasing tension as you release what burdens your spirit...",
        "As you inhale, silently pray: 'I breathe in Your peace...'",
        "As you exhale, release: 'I let go of resentment...'",
        "Continue this sacred rhythm: 'I breathe in mercy... I release judgment...'",
        "Feel the rhythm of divine forgiveness with each breath. Let your body soften in trust...",
        "When ready, return to your natural breathing. Notice the peace that passes understanding..."
      ]
    },
    {
      id: '5',
      title: 'Healing the Inner Child',
      duration: '20 minutes',
      description: 'Connect with your younger self and offer the compassion you needed during painful times.',
      category: 'Inner Healing',
      script: [
        "Get comfortable and close your eyes. Take several deep breaths, remembering that children are a heritage from the Lord...",
        "Imagine walking down a sacred path to meet your younger self - the child who was fearfully and wonderfully made...",
        "See this child clearly. Notice their expression, their posture, remembering they are precious in divine sight...",
        "Approach this child with the gentleness of a shepherd. What do they need from you right now? Safety? Comfort? Understanding?",
        "Sit with them. Hold their hand if it feels right. Listen as a parent listens to their child...",
        "Offer them the love and protection of the One who cares for the sparrow: 'You are safe now. I am here for you...'",
        "If there was hurt in their past, acknowledge it: 'That was painful, and you were precious even then...'",
        "Bring them into the present. Show them how divine strength has carried them and how they are being restored...",
        "End by holding both the child and your adult self in the loving awareness of the Creator. Open your eyes slowly..."
      ]
    },
    {
      id: '6',
      title: 'Gratitude and Release',
      duration: '14 minutes',
      description: 'Practice gratitude while gently releasing what no longer serves your highest good.',
      category: 'Gratitude',
      script: [
        "Find a comfortable position. Close your eyes and settle into the present moment, giving thanks for this sacred time...",
        "Begin by bringing to mind three things you're grateful for. Let thanksgiving fill your heart as an offering...",
        "Now, think of a hurt or resentment you're ready to release. Hold it gently in divine awareness...",
        "Ask yourself: What lesson has this taught me? What strength has been forged in this fire?",
        "Express gratitude for the growth, even as you prepare to release the pain, remembering 'all things work together for good...'",
        "Visualize the resentment as a burden. With each breath, feel the divine help making it lighter...",
        "When you're ready, imagine releasing it to the One who carries our burdens. Watch it be lifted away...",
        "Fill the space with gratitude for your healing journey and the divine capacity for forgiveness within you...",
        "Take a few deep breaths, feeling the lightness of release and the warmth of thanksgiving..."
      ]
    }
  ];

  const categories = ['All', 'Forgiveness', 'Self-Care', 'Compassion', 'Breathing', 'Inner Healing', 'Gratitude'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredMeditations = activeCategory === 'All'
    ? meditations
    : meditations.filter(m => m.category === activeCategory);

  const handlePlayMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setCurrentScriptStep(0);
  };

  const handleNextStep = () => {
    if (selectedMeditation && currentScriptStep < selectedMeditation.script.length - 1) {
      setCurrentScriptStep(currentScriptStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentScriptStep > 0) {
      setCurrentScriptStep(currentScriptStep - 1);
    }
  };

  const handleCloseMeditation = () => {
    setSelectedMeditation(null);
    setCurrentScriptStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
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
              <Link href="/learn" className="text-gray-600 hover:text-gray-900 transition-colors">Learn</Link>
              <Link href="/meditate" className="text-blue-600 font-semibold">Meditate</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Guided Meditation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find peace through meditation. These guided sessions are designed specifically for
            forgiveness work and emotional healing.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-800 text-sm">
              🎧 <strong>Coming Soon:</strong> Audio meditations will be available. For now, use these as reading meditations.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Meditation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredMeditations.map((meditation) => (
            <div key={meditation.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{meditation.title}</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{meditation.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{meditation.duration}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {meditation.category}
                </span>
              </div>
              <button
                onClick={() => handlePlayMeditation(meditation)}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Begin Meditation
              </button>
            </div>
          ))}
        </div>

        {/* Meditation Player Modal */}
        {selectedMeditation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedMeditation.title}
                    </h2>
                    <p className="text-gray-600">{selectedMeditation.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Step {currentScriptStep + 1} of {selectedMeditation.script.length} • {selectedMeditation.duration}
                    </div>
                  </div>
                  <button
                    onClick={handleCloseMeditation}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentScriptStep + 1) / selectedMeditation.script.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Script Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-8 mb-6">
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-700 font-semibold text-sm">{currentScriptStep + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-orange-800 text-lg leading-relaxed font-medium">
                          {selectedMeditation.script[currentScriptStep]}
                        </p>
                      </div>
                    </div>

                    {/* Breathing Cue for certain steps */}
                    {(currentScriptStep === 1 || currentScriptStep === 3 || currentScriptStep === 6) && (
                      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg border border-orange-300">
                        <p className="text-orange-700 text-sm italic">
                          💨 Take your time with this step. Breathe deeply and allow the words to settle into your heart.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePreviousStep}
                      disabled={currentScriptStep === 0}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>

                    <div className="text-sm text-gray-500">
                      {currentScriptStep + 1} / {selectedMeditation.script.length}
                    </div>

                    {currentScriptStep < selectedMeditation.script.length - 1 ? (
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={handleCloseMeditation}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        Complete Meditation
                      </button>
                    )}
                  </div>

                  {/* Completion Message */}
                  {currentScriptStep === selectedMeditation.script.length - 1 && (
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800">Meditation Complete</h3>
                      </div>
                      <p className="text-green-700 mb-4">
                        You have completed this sacred meditation practice. May the peace and wisdom you&apos;ve cultivated continue to guide you.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                          Save Progress
                        </button>
                        <button className="border border-green-300 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                          Try Another Meditation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Meditation for Forgiveness?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emotional Regulation</h3>
              <p className="text-gray-600 text-sm">
                Meditation helps you observe emotions without being overwhelmed by them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compassion Building</h3>
              <p className="text-gray-600 text-sm">
                Develops empathy for yourself and others, essential for forgiveness.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stress Reduction</h3>
              <p className="text-gray-600 text-sm">
                Lowers cortisol levels and creates mental space for healing work.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Temperature Indicator */}
      <TemperatureIndicator
        currentPage="meditate"
        progress={selectedMeditation ? ((currentScriptStep + 1) / selectedMeditation.script.length) * 100 : 0}
      />
    </div>
  );
}
