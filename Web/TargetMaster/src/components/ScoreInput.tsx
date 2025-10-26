import { useState } from 'react'
import TargetSelector from './TargetSelector'

interface TrainingData {
  id: string
  date: string
  competitionType: string
  scores: number[]
  totalScore: number
  averageScore: number
  timestamp: string
}

interface MonthGroup {
  month: string
  trainings: TrainingData[]
}

export default function ScoreInput() {
  const [showNewTraining, setShowNewTraining] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [currentScore, setCurrentScore] = useState('')
  const [competitionType, setCompetitionType] = useState('practice')
  const [trainingDate, setTrainingDate] = useState(new Date().toISOString().split('T')[0])
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [trainingTitle, setTrainingTitle] = useState('연습 훈련')
  const [distance, setDistance] = useState(15)
  const [arrowCount, setArrowCount] = useState(6)
  const [selectedTarget, setSelectedTarget] = useState('wa_vertical_3_spot')
  const [showDetailPage, setShowDetailPage] = useState(false)

  // 로컬 스토리지에서 훈련 데이터 가져오기
  const getTrainings = (): TrainingData[] => {
    return JSON.parse(localStorage.getItem('trainingData') || '[]')
  }

  // 월별로 그룹화
  const groupTrainingsByMonth = (trainings: TrainingData[]): MonthGroup[] => {
    const groups: { [key: string]: TrainingData[] } = {}
    
    trainings.forEach(training => {
      const date = new Date(training.date)
      const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
      
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(training)
    })

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // 최신순 정렬
      .map(month => ({
        month,
        trainings: groups[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }))
  }

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

  const handleSaveTraining = () => {
    if (scores.length === 0) {
      alert('최소 1개 이상의 점수를 입력해주세요.')
      return
    }

    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / scores.length

    const trainingData: TrainingData = {
      id: Date.now().toString(),
      date: trainingDate,
      competitionType: trainingTitle,
      scores: [...scores],
      totalScore,
      averageScore: Math.round(averageScore * 10) / 10,
      timestamp: new Date().toISOString()
    }

    // 로컬 스토리지에 저장
    const existingTrainings = getTrainings()
    existingTrainings.push(trainingData)
    localStorage.setItem('trainingData', JSON.stringify(existingTrainings))

    // 폼 초기화
    setScores([])
    setCurrentScore('')
    setShowNewTraining(false)
    setTrainingTitle('연습 훈련')
    setDistance(15)
    setArrowCount(6)
    alert('훈련 기록이 저장되었습니다!')
  }

  const handleCancelNewTraining = () => {
    setScores([])
    setCurrentScore('')
    setShowNewTraining(false)
    setTrainingTitle('연습 훈련')
    setDistance(15)
    setArrowCount(6)
  }

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  const handleStartRecording = () => {
    // 훈련 설정 저장 및 상세 기록 페이지로 이동
    setShowDetailPage(true)
  }

  const trainings = getTrainings()
  const monthGroups = groupTrainingsByMonth(trainings)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">훈련 기록</h1>
          <p className="text-lg text-gray-600">양궁 훈련 기록을 관리하세요</p>
        </div>

                 {/* 새 훈련 생성 버튼 */}
         <div className="mb-8">
           <button
             onClick={() => setShowNewTraining(true)}
             style={{ border: 'none', outline: 'none' }}
             className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 focus:outline-none"
           >
             + 새 훈련 생성
           </button>
         </div>

        {/* 새 훈련 생성 폼 */}
        {showNewTraining && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {/* 녹색 헤더 */}
            <div className="bg-green-600 py-4 flex items-center px-4">
              <div className="flex-1"></div>
              <button
                onClick={handleCancelNewTraining}
                style={{ border: 'none', outline: 'none' }}
                className="text-black bg-white hover:bg-gray-100 transition-colors p-2 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 2x2 그리드 레이아웃 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1행 1열: 타이틀 */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">타이틀</h2>
                  <input
                    type="text"
                    value={trainingTitle}
                    onChange={(e) => setTrainingTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="연습 훈련"
                  />
                  <p className="text-sm text-gray-500">생성 일자: {trainingDate}</p>
                </div>

                {/* 1행 2열: 거리 */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">거리 <span className="text-xl text-purple-600">{distance}m</span></h2>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    step="5"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                                                  {/* 2행 1열: 타겟 */}
                 <div className="space-y-2">
                   <h2 className="text-2xl font-semibold text-gray-900">타겟</h2>
                   <TargetSelector value={selectedTarget} onChange={setSelectedTarget} />
                 </div>

                {/* 2행 2열: 화살 수 */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-900">화살 수 <span className="text-xl text-purple-600">{arrowCount}화살</span></h2>
                  <input
                    type="range"
                    min="1"
                    max="72"
                    step="1"
                    value={arrowCount}
                    onChange={(e) => setArrowCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

                             {/* 기록 시작 버튼 */}
               <div className="mt-8 flex justify-center">
                 <button
                   onClick={handleStartRecording}
                   style={{ border: 'none', outline: 'none' }}
                   className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-colors focus:outline-none text-lg"
                 >
                   기록 시작
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* 월별 훈련 기록 */}
        {monthGroups.length > 0 ? (
          <div className="space-y-1">
            {monthGroups.map((group) => {
              const isExpanded = expandedMonths.has(group.month)
              return (
                <div key={group.month} className="bg-white rounded-lg shadow overflow-hidden">
                                     {/* 월 헤더 - 진한 녹색 배경 */}
                   <button
                     onClick={() => toggleMonth(group.month)}
                     style={{ border: 'none', outline: 'none' }}
                     className="w-full px-5 py-3 bg-green-600 text-white flex items-center justify-between hover:bg-green-700 transition-colors"
                   >
                     <span className="text-base font-semibold">{group.month}</span>
                     <svg
                       className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>

                  {/* 훈련 기록 목록 */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {group.trainings.map((training, index) => (
                        <div 
                          key={training.id} 
                          className="px-5 py-3 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">{training.date}</p>
                              <p className="text-base font-medium text-gray-900">
                                {training.competitionType === 'practice' ? '연습 훈련' : 
                                 training.competitionType === 'competition' ? '대회' : '훈련'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-semibold text-gray-900">
                                {training.totalScore}/360
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">아직 훈련 기록이 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">새 훈련을 생성해 기록을 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
