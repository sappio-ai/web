'use client'

import { useState, useEffect } from 'react'
import type { QuizItem, QuizFeedback } from '@/lib/types/quiz'
import MCQOptions from './MCQOptions'
import Orb from '../orb/Orb'

interface QuestionCardProps {
  question: QuizItem
  userAnswer: string | null
  isAnswered: boolean
  feedback: QuizFeedback | null
  onSubmit: (answer: string) => void
}

export default function QuestionCard({
  question,
  userAnswer,
  isAnswered,
  feedback,
  onSubmit,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(
    userAnswer || ''
  )

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(userAnswer || '')
  }, [question.id, userAnswer])

  const handleSubmit = () => {
    if (selectedAnswer) {
      onSubmit(selectedAnswer)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl rounded-2xl border border-white/20 p-8">
      {/* Question */}
      <h3 className="text-2xl text-white mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Answer Input - MCQ Only */}
      {question.options_json && (
        <MCQOptions
          options={question.options_json}
          selectedAnswer={selectedAnswer}
          correctAnswer={isAnswered ? question.answer : null}
          onSelect={setSelectedAnswer}
          disabled={isAnswered}
        />
      )}

      {/* Submit Button */}
      {!isAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white text-lg font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Submit Answer
        </button>
      )}

      {/* Feedback */}
      {isAnswered && feedback && (
        <div
          className={`mt-6 p-6 rounded-xl border-2 ${
            feedback.isCorrect
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Orb
              pose={
                feedback.isCorrect ? 'success-celebrating' : 'error-confused'
              }
              size="sm"
            />
            <p
              className={`font-bold text-lg ${
                feedback.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </div>

          {!feedback.isCorrect && (
            <p className="text-gray-300 mb-3">
              <span className="font-medium">Correct answer:</span>{' '}
              {feedback.correctAnswer}
            </p>
          )}

          {feedback.explanation && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="font-medium text-gray-300">Explanation:</span>{' '}
                {feedback.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
