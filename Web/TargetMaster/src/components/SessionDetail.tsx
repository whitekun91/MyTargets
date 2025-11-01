import { useState, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
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

interface EndScore {
  round_number: number
  total_score: number
  arrow_count: number
  max_score: number
}

interface SessionDetailProps {
  session: TrainingSession
  onBack: () => void
  onStartRound: (roundNumber: number) => void
}

export default function SessionDetail({ session, onBack, onStartRound }: SessionDetailProps) {
  const [endScores, setEndScores] = useState<EndScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEndScores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id])

  const loadEndScores = async () => {
    try {
      setIsLoading(true)
      const scores: EndScore[] = []

      // console.log('📥 세션 정보:', session)
      // console.log('📥 current_round:', session.current_round)

      // 각 라운드의 점수 불러오기 (1부터 최대 100까지 시도하되, 데이터가 있는 것만 추가)
      for (let round = 1; round <= 100; round++) {
        try {
          const response = await trainingAPI.getScores(session.id, round)
          // console.log(`📥 라운드 ${round} 응답:`, response)
          
          if (response.success && response.data && response.data.scores && response.data.scores.length > 0) {
            const roundTotal = response.data.scores.reduce(
              (sum: number, score: any) => sum + (score.score || 0),
              0
            )
            const arrowCount = response.data.scores.length
            scores.push({
              round_number: round,
              total_score: roundTotal,
              arrow_count: arrowCount,
              max_score: arrowCount * 10
            })
            // console.log(`✅ 라운드 ${round} 추가:`, { roundTotal, arrowCount })
          } else {
            // 연속으로 데이터가 없으면 중단
            if (scores.length > 0 && round > scores[scores.length - 1].round_number + 5) {
              // console.log(`⚠️ 라운드 ${round}부터 데이터 없음, 중단`)
              break
            }
          }
        } catch (error) {
          // 에러가 나면 해당 라운드는 스킵
          // console.log(`⚠️ 라운드 ${round} 로드 오류, 스킵`)
          if (scores.length > 0 && round > scores[scores.length - 1].round_number + 5) {
            break
          }
        }
      }

      // console.log('📥 최종 엔드 목록:', scores)
      setEndScores(scores)
    } catch (error) {
      console.error('엔드 점수 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRound = () => {
    // 다음 라운드로 이동 (가장 마지막 엔드 번호 + 1)
    const nextRound = endScores.length > 0 
      ? Math.max(...endScores.map(e => e.round_number)) + 1 
      : 1
    // console.log('➕ 새 라운드 추가:', nextRound)
    onStartRound(nextRound)
  }

  const handleContinueRound = (roundNumber: number) => {
    onStartRound(roundNumber)
  }

  const totalScore = endScores.reduce((sum, end) => sum + end.total_score, 0)
  const totalMaxScore = endScores.reduce((sum, end) => sum + end.max_score, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 메인 콘텐츠 */}
      <div className="p-4">
        {/* 뒤로 가기 버튼 */}
        <div className="mt-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">뒤로 가기</span>
          </button>
        </div>

        {/* 세션 정보 */}
        <div className="bg-white rounded-lg p-6 mb-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">날짜</p>
              <p className="text-lg font-semibold">
                {new Date(session.date).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">거리</p>
              <p className="text-lg font-semibold">{session.distance}m</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">총 점수</p>
              <p className="text-lg font-semibold text-green-600">
                {totalScore} / {totalMaxScore}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">엔드 수</p>
              <p className="text-lg font-semibold">{endScores.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">평균 점수</p>
              <p className="text-lg font-semibold">
                {endScores.length > 0 ? (totalScore / endScores.reduce((sum, end) => sum + end.arrow_count, 0)).toFixed(1) : '0.0'}점
              </p>
            </div>
          </div>
        </div>

        {/* End 추가 버튼 */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleAddRound}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>새 End 추가</span>
          </button>
        </div>

        {/* 엔드별 점수 목록 */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">엔드별 점수</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : endScores.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">아직 기록된 엔드가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">위의 "새 라운드 추가" 버튼을 눌러 시작하세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {endScores.map((end) => (
                <button
                  key={end.round_number}
                  onClick={() => handleContinueRound(end.round_number)}
                  className="w-full px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        End {end.round_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {end.arrow_count}발 기록
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {end.total_score} / {end.max_score}
                      </p>
                      <p className="text-sm text-gray-500">
                        평균: {(end.total_score / end.arrow_count).toFixed(1)}점
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

