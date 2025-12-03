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
    <div className="relative">
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
      <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
        {/* Question */}
        <h3 className="text-[20px] text-[#1A1D2E] mb-6 leading-relaxed font-semibold">
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
            className="mt-6 w-full px-8 py-4 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white text-[16px] font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Submit Answer
          </button>
        )}

        {/* Feedback */}
        {isAnswered && feedback && (
          <div
            className={`mt-6 p-6 rounded-xl border-2 ${
              feedback.isCorrect
                ? 'bg-[#10B981]/5 border-[#10B981]/30'
                : 'bg-[#EF4444]/5 border-[#EF4444]/30'
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
                className={`font-bold text-[18px] ${
                  feedback.isCorrect ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
            </div>

            {!feedback.isCorrect && (
              <p className="text-[#475569] mb-3 text-[15px]">
                <span className="font-semibold">Correct answer:</span>{' '}
                {feedback.correctAnswer}
              </p>
            )}

            {feedback.explanation && (
              <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                <p className="text-[#64748B] text-[14px] leading-relaxed">
                  <span className="font-semibold text-[#475569]">Explanation:</span>{' '}
                  {feedback.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
