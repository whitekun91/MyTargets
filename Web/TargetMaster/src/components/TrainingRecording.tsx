import { useState, useEffect } from 'react'
import { ArrowLeft, Target, Plus, Minus, Check } from 'lucide-react'

interface TrainingSession {
  id: number
  session_name: string
  name: string
  organization: string
  date: string
  weather?: string
  wind?: string
  distance?: number
  target_type?: string
  total_rounds: number
  current_round: number
  total_score: number
}

interface TrainingRecordingProps {
  session: TrainingSession
  onBack: () => void
}

export default function TrainingRecording({ session, onBack }: TrainingRecordingProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentScore, setCurrentScore] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const maxRounds = session.total_rounds
  const completedRounds = roundScores.length
  const totalScore = roundScores.reduce((sum, score) => sum + score, 0)

  const handleScoreChange = (score: number) => {
    setCurrentScore(score)
  }

  const handleAddScore = async () => {
    if (currentScore < 0 || currentScore > 10) {
      alert('점수는 0-10 사이의 숫자를 입력해주세요.')
      return
    }

    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/training/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          training_id: session.id,
          round_number: currentRound,
          score: currentScore,
          arrow_number: roundScores.length + 1
        })
      })

      const data = await response.json()

      if (data.success) {
        setRoundScores([...roundScores, currentScore])
        setCurrentScore(0)
        
        if (currentRound < maxRounds) {
          setCurrentRound(currentRound + 1)
        } else {
          // 모든 라운드 완료
          setIsRecording(false)
          alert('모든 라운드가 완료되었습니다!')
        }
      } else {
        alert(data.message || '점수 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('점수 저장 오류:', error)
      alert('점수 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
  }

  const handleUndoLastScore = () => {
    if (roundScores.length > 0) {
      setRoundScores(roundScores.slice(0, -1))
      if (currentRound > 1) {
        setCurrentRound(currentRound - 1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 녹색 헤더 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold">{session.session_name}</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4">
        {!isRecording ? (
          /* 시작 화면 */
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">라운드 {currentRound}</h2>
              <p className="text-gray-600">{completedRounds}/{maxRounds} 라운드 완료</p>
            </div>

            {completedRounds > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">현재 점수</h3>
                <p className="text-3xl font-bold text-green-600">{totalScore}점</p>
                <p className="text-sm text-gray-600">평균: {(totalScore / completedRounds).toFixed(1)}점</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-12 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 gradient-animate"
                style={{ border: 'none', outline: 'none' }}
              >
                <ArrowLeft size={20} />
                <span>뒤로 가기</span>
              </button>
              
              <button
                onClick={handleStartRecording}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-12 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                style={{ border: 'none', outline: 'none' }}
              >
                <Target size={20} />
                <span>기록 시작</span>
              </button>
            </div>
          </div>
        ) : (
          /* 기록 화면 */
          <div className="space-y-6">
            {/* 라운드 정보 */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">라운드 {currentRound}</h2>
                <span className="text-sm text-gray-600">{completedRounds + 1}/{maxRounds}</span>
              </div>
              
              {/* 점수 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    점수 입력 (0-10)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleScoreChange(Math.max(0, currentScore - 1))}
                      className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={currentScore}
                        onChange={(e) => setCurrentScore(Number(e.target.value))}
                        className="w-20 text-3xl font-bold text-center border-0 focus:outline-none"
                      />
                    </div>
                    
                    <button
                      onClick={() => handleScoreChange(Math.min(10, currentScore + 1))}
                      className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* 점수 버튼들 */}
                <div className="grid grid-cols-6 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => setCurrentScore(score)}
                      className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                        currentScore === score
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddScore}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>점수 저장</span>
                  </>
                )}
              </button>

              {roundScores.length > 0 && (
                <button
                  onClick={handleUndoLastScore}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  되돌리기
                </button>
              )}
            </div>

            {/* 현재 점수 요약 */}
            {completedRounds > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">현재 점수</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">{totalScore}점</span>
                  <span className="text-sm text-gray-600">
                    평균: {(totalScore / completedRounds).toFixed(1)}점
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
