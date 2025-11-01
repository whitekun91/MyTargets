import { useState, useEffect } from 'react'
import TrainingSession from './TrainingSession'
import TargetScoreInput from './TargetScoreInput'
import SessionDetail from './SessionDetail'
import { trainingAPI } from '../utils/api'
import { Trash2 } from 'lucide-react'



interface TrainingSession {
  id: number
  session_name: string
  name: string
  organization: string
  date: string
  distance?: number
  target_type?: string
  arrow_count?: number
  current_round: number
  total_score: number
  actual_end_count?: number
  max_score?: number
}

export default function ScoreInput() {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [currentView, setCurrentView] = useState<'list' | 'session' | 'detail' | 'recording'>('list')
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null)
  const [dbSessions, setDbSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1)

  // DB에서 훈련 세션 가져오기
  useEffect(() => {
    const loadDbSessions = async () => {
      try {
        setIsLoading(true)
        const response = await trainingAPI.getTrainingSessions()
        
        if (response.success && response.data) {
          // 각 세션의 실제 엔드 수와 최대 점수 계산
          const sessionsWithStats = await Promise.all(
            response.data.sessions.map(async (session: TrainingSession) => {
              try {
                let endCount = 0
                let totalMaxScore = 0
                
                // console.log(`📊 세션 ${session.id} (${session.session_name}) 점수 계산 시작...`)
                
                // 최대 100개 라운드까지 확인
                for (let round = 1; round <= 100; round++) {
                  try {
                    const roundResponse = await trainingAPI.getScores(session.id, round)
                    if (roundResponse.success && roundResponse.data && roundResponse.data.scores && roundResponse.data.scores.length > 0) {
                      endCount++
                      const roundMaxScore = roundResponse.data.scores.length * 10
                      totalMaxScore += roundMaxScore
                      // console.log(`  ✅ 라운드 ${round}: ${roundResponse.data.scores.length}발 = ${roundMaxScore}점`)
                    } else {
                      // 연속 5개 라운드에 데이터가 없으면 중단
                      if (endCount > 0 && round > endCount + 5) {
                        // console.log(`  ⏹️ 라운드 ${round}에서 중단 (연속 5개 데이터 없음)`)
                        break
                      }
                    }
                  } catch {
                    if (endCount > 0 && round > endCount + 5) {
                      break
                    }
                  }
                }
                
                // console.log(`📊 세션 ${session.id} 최종: ${endCount}개 엔드, 최대 ${totalMaxScore}점`)
                
                return {
                  ...session,
                  actual_end_count: endCount,
                  max_score: totalMaxScore
                }
              } catch (error) {
                console.error(`❌ 세션 ${session.id} 계산 오류:`, error)
                return session
              }
            })
          )
          
          setDbSessions(sessionsWithStats)
          
          // 첫 번째 월을 기본으로 확장
          if (sessionsWithStats.length > 0) {
            const firstSession = sessionsWithStats[0]
            const date = new Date(firstSession.date)
            const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
            setExpandedMonths(new Set([monthKey]))
          }
        }
      } catch (error) {
        console.error('훈련 세션 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDbSessions()
  }, [])


  // DB 세션을 월별로 그룹화
  const groupDbSessionsByMonth = (sessions: TrainingSession[]) => {
    const groups: { [key: string]: TrainingSession[] } = {}
    
    sessions.forEach(session => {
      const date = new Date(session.date)
      const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
      
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(session)
    })

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // 최신순 정렬
      .map(month => ({
        month,
        sessions: groups[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }))
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
    // 훈련 세션 생성 페이지로 이동
    setCurrentView('session')
  }

  const handleStartTraining = (session: TrainingSession) => {
    setCurrentSession(session)
    setCurrentRoundNumber(1) // 새 훈련은 항상 1라운드부터 시작
    setCurrentView('recording')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setCurrentSession(null)
  }

  const handleBackToSession = () => {
    setCurrentView('session')
  }

  // 세션 목록 새로고침
  const refreshSessions = async () => {
    try {
      const response = await trainingAPI.getTrainingSessions()
      if (response.success && response.data) {
        // 각 세션의 실제 엔드 수와 최대 점수 계산
        const sessionsWithStats = await Promise.all(
          response.data.sessions.map(async (session: TrainingSession) => {
            try {
              let endCount = 0
              let totalMaxScore = 0
              
              // 최대 100개 라운드까지 확인
              for (let round = 1; round <= 100; round++) {
                try {
                  const roundResponse = await trainingAPI.getScores(session.id, round)
                  if (roundResponse.success && roundResponse.data && roundResponse.data.scores && roundResponse.data.scores.length > 0) {
                    endCount++
                    totalMaxScore += roundResponse.data.scores.length * 10
                  } else {
                    if (endCount > 0 && round > endCount + 5) {
                      break
                    }
                  }
                } catch {
                  if (endCount > 0 && round > endCount + 5) {
                    break
                  }
                }
              }
              
              return {
                ...session,
                actual_end_count: endCount,
                max_score: totalMaxScore
              }
            } catch (error) {
              return session
            }
          })
        )
        
        setDbSessions(sessionsWithStats)
      }
    } catch (error) {
      console.error('세션 목록 새로고침 오류:', error)
    }
  }

  const handleSelectSession = (session: TrainingSession) => {
    setCurrentSession(session)
    setCurrentView('detail')
  }

  const handleStartRound = (roundNumber: number) => {
    setCurrentRoundNumber(roundNumber)
    setCurrentView('recording')
  }

  const handleBackToDetail = () => {
    setCurrentView('detail')
  }

  const handleDeleteSession = async (e: React.MouseEvent, session: TrainingSession) => {
    e.stopPropagation()
    const confirmed = window.confirm(`정말로 "${session.session_name}" 세션을 삭제하시겠습니까? (복구 불가)`)
    if (!confirmed) return
    try {
      const res = await trainingAPI.deleteSession(session.id)
      if (res.success) {
        const newList = dbSessions.filter(s => s.id !== session.id)
        setDbSessions(newList)
        alert('세션이 삭제되었습니다.')
      } else {
        alert(res.message || '세션 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('세션 삭제 오류:', error)
      alert('세션 삭제 중 오류가 발생했습니다.')
    }
  }

  const dbMonthGroups = groupDbSessionsByMonth(dbSessions)

  // 훈련 세션 생성 화면
  if (currentView === 'session') {
    return (
      <TrainingSession
        onBack={handleBackToList}
        onStartTraining={handleStartTraining}
      />
    )
  }

  // 세션 상세 화면
  if (currentView === 'detail' && currentSession) {
    return (
      <SessionDetail
        session={currentSession}
        onBack={handleBackToList}
        onStartRound={handleStartRound}
      />
    )
  }

  // 훈련 기록 화면
  if (currentView === 'recording' && currentSession) {
    return (
      <TargetScoreInput
        session={{...currentSession, current_round: currentRoundNumber}}
        arrowCount={currentSession.arrow_count || 6}
        onRefresh={refreshSessions}
        onBack={handleBackToDetail}
      />
    )
  }

  // 기본 목록 화면
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
            onClick={handleStartRecording}
            style={{ border: 'none', outline: 'none' }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 focus:outline-none text-lg"
          >
            + 새 훈련 시작
          </button>
        </div>

         {/* 월별 훈련 기록 */}
         {isLoading ? (
           <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
             <p className="text-gray-500 text-lg">훈련 기록을 불러오는 중...</p>
           </div>
         ) : dbMonthGroups.length > 0 ? (
           <div className="space-y-1">
             {dbMonthGroups.map((group) => {
               const isExpanded = expandedMonths.has(group.month)
               return (
                 <div key={group.month} className="bg-white rounded-lg shadow overflow-hidden">
                   {/* 월 헤더 - 진한 녹색 배경 */}
                   <button
                     onClick={() => toggleMonth(group.month)}
                     style={{ border: 'none', outline: 'none' }}
                     className="w-full px-5 py-3 bg-green-700 text-white flex items-center justify-between hover:bg-green-800 transition-colors"
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
                     <div>
                       {group.sessions.map((session) => (
                         <div
                           key={session.id}
                           onClick={() => handleSelectSession(session)}
                           className="w-full px-5 py-3 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex-1">
                               <p className="text-sm text-gray-500 mb-1">
                                 {new Date(session.date).toLocaleDateString('ko-KR', {
                                   year: 'numeric',
                                   month: '2-digit',
                                   day: '2-digit'
                                 }).replace(/\./g, '.').replace(/\s/g, '')}
                               </p>
                               <p className="text-base font-medium text-gray-900">
                                 {session.session_name}
                               </p>
                             </div>
                             <div className="flex items-center space-x-4">
                               <div className="text-right">
                                 <p className="text-base font-semibold text-gray-900">
                                   {session.total_score} / {session.max_score || 0}
                                 </p>
                               </div>
                               <button
                                 onClick={(e) => handleDeleteSession(e, session)}
                                 className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
                                 title="세션 삭제"
                               >
                                 <Trash2 size={18} />
                               </button>
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
