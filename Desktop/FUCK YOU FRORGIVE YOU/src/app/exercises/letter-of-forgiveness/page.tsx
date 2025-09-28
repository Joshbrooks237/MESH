'use client';

import { useState } from 'react';

import Link from 'next/link';
import TemperatureIndicator from '@/components/TemperatureIndicator';

export default function LetterOfForgivenessPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    hurt: '',
    impact: '',
    understanding: '',
    forgiveness: ''
  });

  const steps = [
    {
      title: "Express Your Hurt",
      description: "Write about what happened and how it made you feel. Don't hold back - this is a safe space.",
      prompt: "What specifically happened that hurt you? How did it make you feel?",
      placeholder: "I felt betrayed when... It made me angry because...",
      key: 'hurt'
    },
    {
      title: "Describe the Impact",
      description: "Explore how this hurt has affected your life, relationships, and sense of self.",
      prompt: "How has this situation changed you or your life?",
      placeholder: "This hurt has made me... I've noticed I now...",
      key: 'impact'
    },
    {
      title: "Seek Understanding",
      description: "Try to understand the other person's perspective, even if you don't agree with their actions.",
      prompt: "What might they have been going through? What circumstances led to this?",
      placeholder: "They might have been struggling with... Perhaps they were...",
      key: 'understanding'
    },
    {
      title: "Choose Forgiveness",
      description: "Write your message of release. This doesn't mean forgetting - it means choosing freedom.",
      prompt: "What do you want to release? What hope do you have moving forward?",
      placeholder: "I choose to release... I hope for...",
      key: 'forgiveness'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [steps[currentStep].key]: value
    }));
  };

  const isStepComplete = responses[steps[currentStep].key as keyof typeof responses].trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">ForgiveForward</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/exercises" className="text-blue-600 font-semibold">Exercises</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Letter of Forgiveness</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            <p className="text-lg font-medium text-gray-800">
              {steps[currentStep].prompt}
            </p>
          </div>

          <textarea
            value={responses[steps[currentStep].key as keyof typeof responses]}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder={steps[currentStep].placeholder}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
          />

          {/* Word count */}
          <div className="mt-2 text-sm text-gray-500 text-right">
            {responses[steps[currentStep].key as keyof typeof responses].length} characters
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepComplete}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              disabled={!isStepComplete}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Complete Exercise
            </button>
          )}
        </div>

        {/* Completion Message */}
        {currentStep === steps.length - 1 && isStepComplete && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
            </div>
            <p className="text-green-700 mb-4">
              You&apos;ve completed the Letter of Forgiveness exercise. This is a significant step in your healing journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Save to My Progress
              </button>
              <button className="border border-green-300 text-green-700 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Share Anonymously
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Print My Letter
              </button>
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="mt-12 text-center">
          <blockquote className="text-lg italic text-gray-600 mb-4">
            &ldquo;Forgiveness is not always easy. At times, it feels more painful than the wound we suffered,
            to forgive the one that inflicted it. And yet, there is no peace without forgiveness.&rdquo;
          </blockquote>
          <cite className="text-gray-500">- Marianne Williamson</cite>
        </div>
      </main>

      {/* Temperature Indicator */}
      <TemperatureIndicator
        currentPage="exercises"
        progress={((currentStep + 1) / steps.length) * 100}
      />
    </div>
  );
}
