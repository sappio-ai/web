'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import Orb from '@/components/orb/Orb'

interface QuizItem {
  id: string
  type: string
  question: string
  answer: string
  options_json?: string[]
  explanation?: string
  topic?: string
}

interface Quiz {
  id: string
  items: QuizItem[]
}

interface QuizViewerProps {
  quizId: string
  studyPackId: string
  roomId: string
  userId: string
  sharedToolId: string
  onComplete?: (result: any) => void
}

export default function QuizViewer({
  quizId,
  studyPackId,
  roomId,
  userId,
  sharedToolId,
  onComplete,
}: QuizViewerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/quizzes/${quizId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }

      const data = await response.json()
      setQuiz(data.quiz)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentIndex]: answer })
  }

  const handleNext = () => {
    if (quiz && currentIndex < quiz.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    // Calculate score
    let correct = 0
    quiz.items.forEach((item, index) => {
      if (answers[index] === item.answer) {
        correct++
      }
    })

    const finalScore = (correct / quiz.items.length) * 100
    setScore(finalScore)
    setShowResults(true)

    try {
      // Record completion
      await fetch(`/api/rooms/${roomId}/shared-tools/${sharedToolId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: {
            score: finalScore,
            correct,
            total: quiz.items.length,
          },
        }),
      })

      if (onComplete) {
        onComplete({
          score: finalScore,
          correct,
          total: quiz.items.length,
        })
      }
    } catch (err) {
      console.error('Failed to record completion:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="processing-thinking" size="lg" />
        <p className="text-[#64748B] mt-4">Loading quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="error-confused" size="lg" />
        <p className="text-[#EF4444] mt-4">{error}</p>
      </div>
    )
  }

  if (!quiz || quiz.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Orb pose="neutral" size="lg" />
        <p className="text-[#64748B] mt-4">No quiz questions available</p>
      </div>
    )
  }

  if (showResults) {
    const correct = quiz.items.filter((item, index) => answers[index] === item.answer).length

    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
          
          <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
            <div className="text-center mb-8">
              <Orb pose={score >= 70 ? 'success-celebrating' : 'neutral'} size="lg" />
              <h3 className="text-[24px] font-bold text-[#1A1D2E] mt-4 mb-2">
                Quiz Complete!
              </h3>
              <p className="text-[#64748B] text-[16px]">
                You scored {correct} out of {quiz.items.length}
              </p>
              <div className="mt-4">
                <div className="text-[48px] font-bold text-[#5A5FF0]">
                  {Math.round(score)}%
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              {quiz.items.map((item, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer === item.answer

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-[#10B981]/5 border-[#10B981]/30'
                        : 'bg-[#EF4444]/5 border-[#EF4444]/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                      }`}>
                        {isCorrect ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <X className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[#1A1D2E] font-medium mb-2">
                          {index + 1}. {item.question}
                        </p>
                        {!isCorrect && (
                          <div className="text-[14px] space-y-1">
                            <p className="text-[#EF4444]">
                              Your answer: {userAnswer || 'Not answered'}
                            </p>
                            <p className="text-[#10B981]">
                              Correct answer: {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.items[currentIndex]
  const userAnswer = answers[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-[#64748B] text-[16px]">
          Question {currentIndex + 1} of {quiz.items.length}
        </p>
        {currentQuestion.topic && (
          <p className="text-[#5A5FF0] text-[14px] font-medium mt-1">
            {currentQuestion.topic}
          </p>
        )}
      </div>

      {/* Question Card */}
      <div className="relative mb-6">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <h3 className="text-[20px] font-bold text-[#1A1D2E] mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options_json?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  userAnswer === option
                    ? 'border-[#5A5FF0] bg-[#5A5FF0]/5'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswer === option
                        ? 'border-[#5A5FF0] bg-[#5A5FF0]'
                        : 'border-[#CBD5E1]'
                    }`}
                  >
                    {userAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-[#1A1D2E] text-[15px]">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {quiz.items.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                answers[index]
                  ? 'bg-[#5A5FF0]'
                  : index === currentIndex
                  ? 'bg-[#5A5FF0]/40'
                  : 'bg-[#E2E8F0]'
              }`}
            />
          ))}
        </div>

        {currentIndex === quiz.items.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== quiz.items.length}
            className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white rounded-lg transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
