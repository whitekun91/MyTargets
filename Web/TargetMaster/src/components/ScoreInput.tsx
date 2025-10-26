import { useState, useEffect } from 'react'
import TrainingSession from './TrainingSession'
import TargetScoreInput from './TargetScoreInput'
import { trainingAPI } from '../utils/api'



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
}

export default function ScoreInput() {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [currentView, setCurrentView] = useState<'list' | 'session' | 'recording'>('list')
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null)
  const [dbSessions, setDbSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // DB에서 훈련 세션 가져오기
  useEffect(() => {
    const loadDbSessions = async () => {
      try {
        setIsLoading(true)
        const response = await trainingAPI.getTrainingSessions()
        
        if (response.success && response.data) {
          setDbSessions(response.data.sessions)
          
          // 첫 번째 월을 기본으로 확장
          if (response.data.sessions.length > 0) {
            const firstSession = response.data.sessions[0]
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
        setDbSessions(response.data.sessions)
      }
    } catch (error) {
      console.error('세션 목록 새로고침 오류:', error)
    }
  }

  const handleSelectSession = (session: TrainingSession) => {
    setCurrentSession(session)
    setCurrentView('recording')
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

  // 훈련 기록 화면
  if (currentView === 'recording' && currentSession) {
    return (
      <TargetScoreInput
        session={currentSession}
        arrowCount={currentSession.arrow_count || 6}
        onBack={handleBackToSession}
        onRefresh={refreshSessions}
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
                         <button
                           key={session.id}
                           onClick={() => handleSelectSession(session)}
                           className="w-full px-5 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                           style={{ border: 'none', outline: 'none' }}
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
                             <div className="text-right">
                               <p className="text-base font-semibold text-gray-900">
                                 {session.total_score}/{session.current_round * (session.arrow_count || 6) * 10}
                               </p>
                             </div>
                           </div>
                         </button>
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
