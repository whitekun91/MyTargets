import { useState, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import TargetSelector from './TargetSelector'
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
}

interface TrainingSessionProps {
  onBack: () => void
  onStartTraining: (session: TrainingSession) => void
}

export default function TrainingSession({ onBack, onStartTraining }: TrainingSessionProps) {
  const [sessionName, setSessionName] = useState('연습 훈련')
  const [distance, setDistance] = useState(15)
  const [targetType, setTargetType] = useState('wa_vertical_3_spot')
  const [arrowCount, setArrowCount] = useState(6)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      alert('세션 이름을 입력해주세요.')
      return
    }

    // 로그인 상태 확인
    if (!isLoggedIn) {
      alert('로그인이 필요합니다. 먼저 로그인해주세요.')
      return
    }

    // 토큰 확인
    const token = localStorage.getItem('token')
    // console.log('현재 토큰:', token ? '존재함' : '없음')

    // console.log('세션 생성 시작:', {
    //   session_name: sessionName,
    //   distance,
    //   target_type: targetType,
    // })

    setIsCreating(true)
    
    try {
      const response = await trainingAPI.createSession({
        session_name: sessionName,
        distance,
        target_type: targetType,
        arrow_count: arrowCount,
      })

      // console.log('세션 생성 응답:', response)

      if (response.success && response.data) {
        const session = response.data.session as TrainingSession
        onStartTraining(session)
      } else {
        alert(response.message || '세션 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('세션 생성 오류:', error)
      alert(`세션 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsCreating(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-100">
      {/* 녹색 헤더 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-center mb-4">
          {!isLoggedIn && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
              ⚠️ 로그인이 필요합니다
            </div>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4">
        {/* 2x2 그리드 레이아웃 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* 1행 1열: 타이틀 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">타이틀</h2>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="연습 훈련"
                />
                <p className="text-sm text-gray-500">생성 일자: {new Date().toLocaleDateString('ko-KR')}</p>
              </div>

              {/* 1행 2열: 거리 */}
              <div className="space-y-4">
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
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">타겟</h2>
                <TargetSelector value={targetType} onChange={setTargetType} />
              </div>

              {/* 2행 2열: 화살 수 */}
              <div className="space-y-4">
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

          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-20 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 gradient-animate"
            style={{ border: 'none', outline: 'none' }}
          >
            <ArrowLeft size={20} />
            <span>뒤로 가기</span>
          </button>
          
          <button
            onClick={handleCreateSession}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-20 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
            style={{ border: 'none', outline: 'none' }}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>세션 생성 중...</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>새 훈련 시작</span>
              </>
            )}
          </button>
        </div>

        {/* 라운드 선택 컨테이너 */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">라운드 선택</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* 라운드 리스트는 현재 표시하지 않음 */}
                <div className="px-6 py-8 text-center text-gray-500">
                  <p>새 훈련을 시작하려면 위의 "새 훈련 시작" 버튼을 눌러주세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
