import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { trainingAPI } from '../utils/api'

interface TrainingSession {
  id: number
  session_name: string
  name: string
  organization: string
  date: string
  distance?: number
  target_type?: string
  current_round: number
  total_score: number
  created_at: string
}

interface TrainingHistoryProps {
  onBack: () => void
  onSelectSession: (session: TrainingSession) => void
}

interface GroupedSessions {
  [key: string]: TrainingSession[]
}

export default function TrainingHistory({ onBack, onSelectSession }: TrainingHistoryProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({})
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // 훈련 세션 목록 로드
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true)
        const response = await trainingAPI.getTrainingSessions()
        
        if (response.success && response.data) {
          setSessions(response.data.sessions)
          
          // 월별로 그룹화
          const grouped = response.data.sessions.reduce((acc: GroupedSessions, session) => {
            const date = new Date(session.date)
            const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`
            
            if (!acc[monthKey]) {
              acc[monthKey] = []
            }
            acc[monthKey].push(session)
            
            return acc
          }, {})
          
          setGroupedSessions(grouped)
          
          // 첫 번째 월을 기본으로 확장
          const firstMonth = Object.keys(grouped)[0]
          if (firstMonth) {
            setExpandedMonths(new Set([firstMonth]))
          }
        }
      } catch (error) {
        console.error('훈련 세션 목록 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [])

  // 월 토글
  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(month)) {
      newExpanded.delete(month)
    } else {
      newExpanded.add(month)
    }
    setExpandedMonths(newExpanded)
  }

  // 세션 클릭 핸들러
  const handleSessionClick = (session: TrainingSession) => {
    onSelectSession(session)
  }

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">훈련 기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <span>←</span>
            <span>뒤로 가기</span>
          </button>
          <h1 className="text-xl font-bold">훈련 기록</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">아직 훈련 기록이 없습니다.</p>
            <p className="text-gray-400 mt-2">새로운 훈련을 시작해보세요!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedSessions).map(([month, monthSessions]) => (
              <div key={month} className="bg-white rounded-lg overflow-hidden">
                {/* 월 헤더 */}
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg font-medium text-gray-700">{month}</span>
                  {expandedMonths.has(month) ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </button>

                {/* 세션 목록 */}
                {expandedMonths.has(month) && (
                  <div className="divide-y divide-gray-200">
                    {monthSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.session_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(session.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-medium text-gray-900">
                              {session.total_score}/{session.current_round * 10}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.distance}m
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
