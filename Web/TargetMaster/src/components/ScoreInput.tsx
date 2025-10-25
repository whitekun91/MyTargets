import { useState } from 'react'

interface ScoreData {
  id: string
  playerName: string
  organization: string
  scores: number[]
  totalScore: number
  averageScore: number
  timestamp: string
  competitionType: string
}

export default function ScoreInput() {
  const [playerName, setPlayerName] = useState('')
  const [organization, setOrganization] = useState('')
  const [competitionType, setCompetitionType] = useState('practice')
  const [scores, setScores] = useState<number[]>([])
  const [currentScore, setCurrentScore] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddScore = () => {
    const score = parseInt(currentScore)
    if (score >= 0 && score <= 10) {
      setScores([...scores, score])
      setCurrentScore('')
    } else {
      alert('점수는 0-10 사이의 숫자를 입력해주세요.')
    }
  }

  const handleRemoveScore = (index: number) => {
    setScores(scores.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!playerName.trim() || !organization.trim() || scores.length === 0) {
      alert('모든 필드를 입력하고 최소 1개 이상의 점수를 입력해주세요.')
      return
    }

    setLoading(true)

    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / scores.length

    const scoreData: ScoreData = {
      id: Date.now().toString(),
      playerName: playerName.trim(),
      organization: organization.trim(),
      scores: [...scores],
      totalScore,
      averageScore: Math.round(averageScore * 10) / 10,
      timestamp: new Date().toISOString(),
      competitionType
    }

    // 로컬 스토리지에 저장
    const existingScores = JSON.parse(localStorage.getItem('competitionScores') || '[]')
    existingScores.push(scoreData)
    localStorage.setItem('competitionScores', JSON.stringify(existingScores))

    // 폼 초기화
    setTimeout(() => {
      setPlayerName('')
      setOrganization('')
      setScores([])
      setCurrentScore('')
      setLoading(false)
      alert('점수가 성공적으로 저장되었습니다!')
    }, 1000)
  }

  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const averageScore = scores.length > 0 ? Math.round((totalScore / scores.length) * 10) / 10 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">점수 입력</h1>
          <p className="text-lg text-gray-600">양궁 경기 점수를 입력하고 기록하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 입력 폼 */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">선수 정보</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선수 이름
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="선수 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소속
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="소속을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경기 유형
                </label>
                <select
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="practice">연습</option>
                  <option value="competition">대회</option>
                  <option value="training">훈련</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">점수 입력</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0-10"
                />
                <button
                  onClick={handleAddScore}
                  className="btn-modern px-6 py-3"
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 점수 현황 */}
          <div className="modern-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">점수 현황</h2>
            
            {/* 입력된 점수들 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">입력된 점수</h3>
              <div className="flex flex-wrap gap-2">
                {scores.map((score, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-lg"
                  >
                    <span className="mr-2">{score}점</span>
                    <button
                      onClick={() => handleRemoveScore(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {scores.length === 0 && (
                <p className="text-gray-500 text-sm">아직 입력된 점수가 없습니다.</p>
              )}
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">총 점수</p>
                <p className="text-2xl font-bold text-blue-600">{totalScore}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">평균 점수</p>
                <p className="text-2xl font-bold text-green-600">{averageScore}</p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={loading || scores.length === 0}
              className="w-full btn-modern py-4 text-lg disabled:opacity-50"
            >
              {loading ? '저장 중...' : '점수 저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
