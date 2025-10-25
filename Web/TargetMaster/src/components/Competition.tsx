import { useState, useEffect } from 'react'

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

export default function Competition() {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('averageScore')

  useEffect(() => {
    // 로컬 스토리지에서 점수 데이터 불러오기
    const savedScores = localStorage.getItem('competitionScores')
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [])

  const filteredScores = scores.filter(score => {
    if (filter === 'all') return true
    return score.competitionType === filter
  })

  const sortedScores = [...filteredScores].sort((a, b) => {
    switch (sortBy) {
      case 'averageScore':
        return b.averageScore - a.averageScore
      case 'totalScore':
        return b.totalScore - a.totalScore
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      default:
        return 0
    }
  })

  const getCompetitionTypeText = (type: string) => {
    switch (type) {
      case 'practice': return '연습'
      case 'competition': return '대회'
      case 'training': return '훈련'
      default: return type
    }
  }

  const getCompetitionTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-blue-100 text-blue-800'
      case 'competition': return 'bg-red-100 text-red-800'
      case 'training': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">경기 현황</h1>
          <p className="text-lg text-gray-600">입력된 점수들을 확인하고 순위를 확인하세요</p>
        </div>

        {/* 필터 및 정렬 */}
        <div className="modern-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">경기 유형</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">전체</option>
                  <option value="practice">연습</option>
                  <option value="competition">대회</option>
                  <option value="training">훈련</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="averageScore">평균 점수</option>
                  <option value="totalScore">총 점수</option>
                  <option value="timestamp">최신순</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              총 {filteredScores.length}건의 기록
            </div>
          </div>
        </div>

        {/* 점수 목록 */}
        {sortedScores.length === 0 ? (
          <div className="modern-card p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">아직 기록이 없습니다</h3>
            <p className="text-gray-600 mb-8">점수 입력 페이지에서 첫 번째 점수를 입력해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedScores.map((score, index) => (
              <div key={score.id} className="modern-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{score.playerName}</h3>
                      <p className="text-sm text-gray-600">{score.organization}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionTypeColor(score.competitionType)}`}>
                    {getCompetitionTypeText(score.competitionType)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">평균 점수</p>
                    <p className="text-2xl font-bold text-blue-600">{score.averageScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">총 점수</p>
                    <p className="text-2xl font-bold text-green-600">{score.totalScore}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">점수 상세</p>
                  <div className="flex flex-wrap gap-1">
                    {score.scores.map((s, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          s >= 9 ? 'bg-green-100 text-green-800' :
                          s >= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(score.timestamp).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
