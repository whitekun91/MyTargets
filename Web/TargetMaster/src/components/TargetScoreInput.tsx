import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
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

interface TargetScoreInputProps {
  session: TrainingSession
  arrowCount: number
  onRefresh?: () => void
  onBack?: () => void
}

interface Shot {
  id: number
  x: number
  y: number
  score: number
  scoringRing: number
}

// 안드로이드 앱의 WA Full 타겟 색상 정의
const WA_COLORS = {
  LEMON_YELLOW: '#FFE135',    // -0x914f1
  FLAMINGO_RED: '#FC4C4E',    // -0x10b1b4
  CERULEAN_BLUE: '#00B4D8',   // -0xff5211
  BLACK: '#000000',           // -0x1000000
  WHITE: '#FFFFFF',           // -0x1
  DARK_GRAY: '#2D2D2D'        // -0xdde0e1
}

export default function TargetScoreInput({ session, arrowCount, onRefresh, onBack }: TargetScoreInputProps) {
  const [shots, setShots] = useState<Shot[]>([])
  const [currentShot, setCurrentShot] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState<number>(session.current_round)
  const [cumulativeScore, setCumulativeScore] = useState<number>(0)

  // 기존 점수 불러오기 및 누적 점수 계산
  useEffect(() => {
    const loadExistingScores = async () => {
      try {
        setIsLoading(true)
        
        // 현재 라운드의 점수 불러오기
        const response = await trainingAPI.getScores(session.id, currentRound)
        
        if (response.success && response.data) {
          // arrow_number 순서대로 정렬
          const sortedScores = response.data.scores.sort((a: any, b: any) => a.arrow_number - b.arrow_number)
          
          const existingShots: Shot[] = sortedScores.map((score: any) => ({
            id: score.arrow_number,
            x: score.x !== null && score.x !== undefined ? score.x : 0, // DB에서 좌표 불러오기
            y: score.y !== null && score.y !== undefined ? score.y : 0,
            score: score.score,
            scoringRing: score.scoring_ring !== null && score.scoring_ring !== undefined ? score.scoring_ring : 0
          }))
          
          // console.log('📥 DB에서 불러온 화살 데이터 (정렬됨):', existingShots)
          
          setShots(existingShots)
          setCurrentShot(existingShots.length)
        }
        
        // 1부터 currentRound까지의 누적 점수 계산
        let totalScore = 0
        for (let round = 1; round <= currentRound; round++) {
          try {
            const roundResponse = await trainingAPI.getScores(session.id, round)
            if (roundResponse.success && roundResponse.data) {
              const roundScore = roundResponse.data.scores.reduce(
                (sum: number, score: any) => sum + (score.score || 0),
                0
              )
              totalScore += roundScore
            }
          } catch (error) {
            console.error(`라운드 ${round} 점수 불러오기 오류:`, error)
          }
        }
        setCumulativeScore(totalScore)
        
      } catch (error) {
        console.error('기존 점수 불러오기 오류:', error)
        // 오류가 발생해도 계속 진행
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingScores()
  }, [session.id, currentRound])

  // 타겟 타입별 점수 계산 (안드로이드 앱 로직 참조)
  const calculateScore = (x: number, y: number): { score: number; scoringRing: number } => {
    // 타겟 중심에서의 거리 계산
    const centerX = 400 // 타겟 중심 X 좌표 (800x800 캔버스)
    const centerY = 400 // 타겟 중심 Y 좌표
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    
    // 타겟 반지름
    const radius = 400
    const normalizedDistance = distance / radius
    
    // console.log('🎯 클릭 위치:', { 
    //   percentage: `${(normalizedDistance * 100).toFixed(2)}%`,
    //   targetType: session.target_type,
    //   normalizedDistance: normalizedDistance.toFixed(4)
    // })
    
    
    // 타겟 타입별 점수 계산
    switch (session.target_type) {
      case 'wa_6_ring':
        // WA 6 Ring 타겟 (이미지 기준) - 1번:X, 2번:10, 3번:9, 4번:8, 5번:7, 6번:6, 7번:5
        if (normalizedDistance <= 0.084) {
          // console.log('🎯 X (10점) - 임계값: 0.084 (8.4%)')
          return { score: 10, scoringRing: 0 } // 1번 - X (8.4%) - 정중앙 X
        } else if (normalizedDistance <= 0.166) {
          // console.log('🎯 10점 - 임계값: 0.166 (16.6%)')
          return { score: 10, scoringRing: 1 } // 2번 - 10점 (16.6%) - 10점 라인
        } else if (normalizedDistance <= 0.334) {
          // console.log('🎯 9점 - 임계값: 0.334 (33.4%)')
          return { score: 9, scoringRing: 2 } // 3번 - 9점 (33.4%) - 9점 라인
        } else if (normalizedDistance <= 0.5) {
          // console.log('🎯 8점 - 임계값: 0.5 (50%)')
          return { score: 8, scoringRing: 3 } // 4번 - 8점 (50%) - 8점 라인
        } else if (normalizedDistance <= 0.666) {
          // console.log('🎯 7점 - 임계값: 0.666 (66.6%)')
          return { score: 7, scoringRing: 4 } // 5번 - 7점 (66.6%) - 7점 라인
        } else if (normalizedDistance <= 0.917) {
          // console.log('🎯 6점 - 임계값: 0.917 (91.7%)')
          return { score: 6, scoringRing: 5 } // 6번 - 6점 (91.7%) - 6점 라인
        } else if (normalizedDistance <= 1.0) {
          // console.log('🎯 5점 (마지막 라인) - 임계값: 1.0 (100%)')
          return { score: 5, scoringRing: 6 } // 7번 - 5점 (100%) - 5점 라인 (마지막)
        } else {
          // console.log('🎯 M (미스) - 임계값 초과: 1.0 (100%)')
          return { score: 0, scoringRing: -1 } // M (미스) - 과녁 밖
        }
      
      case 'wa_5_ring':
        // WA 5 Ring 타겟 (이미지 기준) - 1번:X, 2번:10, 3번:9, 4번:8, 5번:7, 6번:6, 7번:5
        if (normalizedDistance <= 0.1) {
          // console.log('🎯 X (10점) - 임계값: 0.1 (10%)')
          return { score: 10, scoringRing: 0 } // 1번 - X (10%) - 정중앙 X
        } else if (normalizedDistance <= 0.2) {
          // console.log('🎯 10점 - 임계값: 0.2 (20%)')
          return { score: 10, scoringRing: 1 } // 2번 - 10점 (20%) - 10점 라인
        } else if (normalizedDistance <= 0.4) {
          // console.log('🎯 9점 - 임계값: 0.4 (40%)')
          return { score: 9, scoringRing: 2 } // 3번 - 9점 (40%) - 9점 라인
        } else if (normalizedDistance <= 0.6) {
          // console.log('🎯 8점 - 임계값: 0.6 (60%)')
          return { score: 8, scoringRing: 3 } // 4번 - 8점 (60%) - 8점 라인
        } else if (normalizedDistance <= 0.8) {
          // console.log('🎯 7점 - 임계값: 0.8 (80%)')
          return { score: 7, scoringRing: 4 } // 5번 - 7점 (80%) - 7점 라인
        } else if (normalizedDistance <= 1.0) {
          // console.log('🎯 6점 - 임계값: 1.0 (100%)')
          return { score: 6, scoringRing: 5 } // 6번 - 6점 (100%) - 6점 라인
        } else if (normalizedDistance <= 1.2) {
          // console.log('🎯 5점 (마지막 라인) - 임계값: 1.2 (120%)')
          return { score: 5, scoringRing: 6 } // 7번 - 5점 (120%) - 5점 라인 (마지막)
        } else {
          // console.log('🎯 M (미스) - 임계값 초과: 1.2 (120%)')
          return { score: 0, scoringRing: -1 } // M (미스) - 과녁 밖
        }
      
      case 'wa_vertical_3_spot':
      case 'wa_horizontal_3_spot': {
        // 3-스팟: 각 스팟 중심과 반지름을 정의하고, 가장 가까운 스팟 기준으로 6링 로직 적용
        const canvasSize = 800
        const centerX = canvasSize / 2
        const centerY = canvasSize / 2
        const fullRadius = canvasSize / 2

        // 스팟 위치 (캔버스 비율 기준), TargetSelector와 일치
        const spotCenters = session.target_type === 'wa_vertical_3_spot'
          ? [
              { x: centerX, y: canvasSize * 0.25 },
              { x: centerX, y: centerY },
              { x: centerX, y: canvasSize * 0.75 },
            ]
          : [
              { x: canvasSize * 0.25, y: centerY },
              { x: centerX, y: centerY },
              { x: canvasSize * 0.75, y: centerY },
            ]

        // 스팟 반지름 (전체 반지름 대비 비율 0.22로 확대)
        const spotRadius = fullRadius * 0.22

        // 가장 가까운 스팟 중심까지의 거리 계산
        let minDistance = Infinity
        for (const c of spotCenters) {
          const d = Math.hypot(x - c.x, y - c.y)
          if (d < minDistance) minDistance = d
        }

        const normalized = minDistance / spotRadius

        // WA 6 Ring 임계값 사용 (X~5점)
        if (normalized <= 0.084) {
          return { score: 10, scoringRing: 0 }
        } else if (normalized <= 0.166) {
          return { score: 10, scoringRing: 1 }
        } else if (normalized <= 0.334) {
          return { score: 9, scoringRing: 2 }
        } else if (normalized <= 0.5) {
          return { score: 8, scoringRing: 3 }
        } else if (normalized <= 0.666) {
          return { score: 7, scoringRing: 4 }
        } else if (normalized <= 0.834) {
          return { score: 6, scoringRing: 5 }
        } else if (normalized <= 1.0) {
          return { score: 5, scoringRing: 6 }
        }
        return { score: 0, scoringRing: -1 }
      }
      case 'wa_vertical_5_spot':
      case 'wa_horizontal_5_spot':
      case 'wa_vertical_1_spot':
      case 'wa_horizontal_1_spot':
      default:
        // WA Full 타겟 (이미지 기준) - 1번:X, 2번:10, 3번:9, 4번:8, 5번:7, 6번:6, 7번:5, 8번:4, 9번:3, 10번:2, 11번:1
        if (normalizedDistance <= 0.05) {
          // console.log('🎯 X (10점) - 임계값: 0.05 (5%)')
          return { score: 10, scoringRing: 0 } // 1번 - X (5%) - 정중앙 X
        } else if (normalizedDistance <= 0.1) {
          // console.log('🎯 10점 - 임계값: 0.1 (10%)')
          return { score: 10, scoringRing: 1 } // 2번 - 10점 (10%) - 10점 라인
        } else if (normalizedDistance <= 0.21) {
          // console.log('🎯 9점 - 임계값: 0.21 (21%)')
          return { score: 9, scoringRing: 2 } // 3번 - 9점 (20%) - 9점 라인
        } else if (normalizedDistance <= 0.31) {
          // console.log('🎯 8점 - 임계값: 0.3 (30%)')
          return { score: 8, scoringRing: 3 } // 4번 - 8점 (30%) - 8점 라인
        } else if (normalizedDistance <= 0.415) {
          // console.log('🎯 7점 - 임계값: 0.415 (41.5%)')
          return { score: 7, scoringRing: 4 } // 5번 - 7점 (40%) - 7점 라인
        } else if (normalizedDistance <= 0.51) {
          // console.log('🎯 6점 - 임계값: 0.5 (50%)')
          return { score: 6, scoringRing: 5 } // 6번 - 6점 (50%) - 6점 라인
        } else if (normalizedDistance <= 0.61) {
          // console.log('🎯 5점 - 임계값: 0.6 (60%)')
          return { score: 5, scoringRing: 6 } // 7번 - 5점 (60%) - 5점 라인
        } else if (normalizedDistance <= 0.71) {
          // console.log('🎯 4점 - 임계값: 0.7 (70%)')
          return { score: 4, scoringRing: 7 } // 8번 - 4점 (70%) - 4점 라인
        } else if (normalizedDistance <= 0.81) {
          // console.log('🎯 3점 - 임계값: 0.8 (80%)')
          return { score: 3, scoringRing: 8 } // 9번 - 3점 (80%) - 3점 라인
        } else if (normalizedDistance <= 0.91) {
          // console.log('🎯 2점 - 임계값: 0.9 (90%)')
          return { score: 2, scoringRing: 9 } // 10번 - 2점 (90%) - 2점 라인
        } else if (normalizedDistance <= 1.0) {
          // console.log('🎯 1점 (마지막 라인) - 임계값: 1.0 (100%)')
          return { score: 1, scoringRing: 10 } // 11번 - 1점 (100%) - 1점 라인 (마지막)
        } else {
          // console.log('🎯 M (미스) - 임계값 초과: 1.0 (100%)')
          return { score: 0, scoringRing: -1 } // M (미스) - 과녁 밖
        }
    }
  }


  // 캔버스 클릭 핸들러
  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    // console.log('🎯 캔버스 클릭 이벤트 발생!', event.type)
    // console.log('🎯 이벤트 상세:', {
    //   type: event.type,
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   clientX: event.clientX,
    //   clientY: event.clientY
    // })
    
    event.preventDefault()
    event.stopPropagation()
    
    // console.log('🎯 캔버스 클릭됨!', { 
    //   currentShot, 
    //   arrowCount, 
    //   shotsLength: shots.length,
    //   eventType: event.type,
    //   target: event.target
    // })
    
    if (currentShot >= arrowCount) {
      // console.log('❌ 모든 화살을 이미 쏨')
      alert('모든 화살을 이미 쏘셨습니다!')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      // console.log('❌ 캔버스 참조 없음')
      return
    }

    const rect = canvas.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top
    
    // 캔버스 실제 크기와 내부 좌표계(800x800) 스케일 계산
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // 클릭 좌표를 캔버스 내부 좌표계로 변환
    const x = clickX * scaleX
    const y = clickY * scaleY

    // console.log('📍 클릭 좌표:', { 
    //   clickX, 
    //   clickY,
    //   scaledX: x,
    //   scaledY: y,
    //   scaleX,
    //   scaleY,
    //   canvasSize: { width: canvas.width, height: canvas.height },
    //   displaySize: { width: rect.width, height: rect.height }
    // })

    const { score, scoringRing } = calculateScore(x, y)
    // console.log('🎯 계산된 점수:', { score, scoringRing })

    const newShot: Shot = {
      id: currentShot + 1,
      x: x, // 실제 클릭한 x 좌표
      y: y, // 실제 클릭한 y 좌표
      score,
      scoringRing
    }

    const newShots = [...shots, newShot]
    const newCurrentShot = currentShot + 1

    // console.log('✅ 새 화살 추가:', newShot)
    // console.log('📋 새 화살 목록:', newShots)

    setShots(newShots)
    setCurrentShot(newCurrentShot)

    // 점수를 바로 DB에 저장 (자동 저장)
    try {
      const dataToSave = {
        training_id: session.id,
        round_number: currentRound,
        score: newShot.score,
        arrow_number: newShot.id,
        x: newShot.x,
        y: newShot.y,
        scoring_ring: newShot.scoringRing
      }
      
      // console.log('💾 저장할 데이터:', dataToSave)
      
      await trainingAPI.recordScore(dataToSave)
      
      // console.log('✅ 점수, 좌표 및 scoringRing 자동 저장 완료:', newShot)
      
      // 누적 점수 업데이트
      setCumulativeScore(cumulativeScore + newShot.score)
      
      // 세션 목록 새로고침
      onRefresh?.()
    } catch (error) {
      console.error('❌ 점수 저장 오류:', error)
      // 저장 실패 시 롤백
      setShots(shots)
      setCurrentShot(currentShot)
      alert('점수 저장에 실패했습니다. 다시 시도해주세요.')
      return
    }

    // 모든 화살을 쏘면 완료 상태로 설정
    if (newCurrentShot >= arrowCount) {
      // console.log('✅ 모든 화살 완료!', { newCurrentShot, arrowCount, isComplete: true })
      setIsComplete(true)
    }
  }

  // 점수 저장 함수는 자동 저장으로 대체되어 제거됨

  // 마지막 화살 제거
  const handleUndoLastShot = async () => {
    // console.log('🗑️ 마지막 화살 삭제 버튼 클릭됨!', { shotsLength: shots.length, currentShot })
    
    if (shots.length > 0) {
      const lastShot = shots[shots.length - 1]
      const newShots = shots.slice(0, -1)
      const newCurrentShot = currentShot - 1
      
      // console.log('🗑️ 새로운 화살 목록:', newShots)
      // console.log('🗑️ 새로운 현재 화살:', newCurrentShot)
      
      // DB에서도 삭제 (마지막 화살)
      try {
        await trainingAPI.deleteScore(session.id, currentRound, lastShot.id)
        // console.log('💾 DB에서 점수 삭제 완료:', lastShot)
        
        // 누적 점수 업데이트
        setCumulativeScore(cumulativeScore - lastShot.score)
        
        setShots(newShots)
        setCurrentShot(newCurrentShot)
        setIsComplete(false) // 완료 상태 해제
        
        // 세션 목록 새로고침
        onRefresh?.()
        
        // console.log('✅ 화살 삭제 완료!')
      } catch (error) {
        console.error('❌ 점수 삭제 오류:', error)
        alert('점수 삭제에 실패했습니다.')
      }
    } else {
      // console.log('❌ 삭제할 화살이 없습니다')
      alert('삭제할 화살이 없습니다')
    }
  }

  // 다음 End로 이동
  const handleNextEnd = async () => {
    // console.log('➡️ 다음 End 버튼 클릭됨!', { shotsLength: shots.length })
    
    try {
      // 방금 완료한 End의 R 값 계산 및 저장 (localStorage)
      try {
        const completedRound = currentRound
        const resp = await trainingAPI.getScores(session.id, completedRound)
        if (resp.success && resp.data) {
          const endTotal = resp.data.scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0)
          const denominator = arrowCount * completedRound * 10
          const endR = denominator > 0 ? endTotal / denominator : 0
          const key = `endR:${session.id}:${completedRound}`
          localStorage.setItem(key, JSON.stringify({ r: endR, total: endTotal, arrows: arrowCount, round: completedRound }))
          // console.log('✅ End R 저장:', { key, endR, endTotal, denominator })
        }
      } catch (e) {
        // console.warn('End R 계산/저장 실패:', e)
      }
      
      // 다음 End로 이동 (라운드 증가)
      const nextRound = currentRound + 1
      // console.log('➡️ 다음 라운드로 이동:', nextRound)
      
      // 화살 목록 초기화
      setShots([])
      setCurrentShot(0)
      setIsComplete(false)
      setCurrentRound(nextRound)
      
      // 세션 목록 새로고침
      onRefresh?.()
      
      // console.log('✅ 다음 End로 이동 완료!')
    } catch (error) {
      console.error('❌ 다음 End 이동 오류:', error)
      alert('다음 End로 이동 중 오류가 발생했습니다: ' + (error as Error).message)
    }
  }


  // 타겟 타입별 과녁 그리기 (안드로이드 앱 기준)
  useEffect(() => {
    // 로딩 중이면 그리지 않음
    if (isLoading) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = 400
    const centerY = 400
    const radius = 400

    // 타겟 타입별 링 정의
    let zones: Array<{ radius: number; color: string; stroke: string }> = []

    switch (session.target_type) {
      case 'wa_6_ring':
        // WA 6 Ring 타겟 (안드로이드 앱의 WA6Ring 기준)
        zones = [
          { radius: 0.084, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY }, // 10점 (8.4%)
          { radius: 0.166, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY }, // 10점 (16.6%)
          { radius: 0.334, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY }, // 9점 (33.4%)
          { radius: 0.5, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY },   // 8점 (50%)
          { radius: 0.666, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY }, // 7점 (66.6%)
          { radius: 0.834, color: WA_COLORS.CERULEAN_BLUE, stroke: WA_COLORS.DARK_GRAY }, // 6점 (83.4%)
          { radius: 1.0, color: WA_COLORS.CERULEAN_BLUE, stroke: WA_COLORS.DARK_GRAY }   // 5점 (100%)
        ]
        break

      case 'wa_5_ring':
        // WA 5 Ring 타겟 (안드로이드 앱의 WA5Ring 기준)
        zones = [
          { radius: 0.1, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY },   // 10점 (10%)
          { radius: 0.2, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY },   // 10점 (20%)
          { radius: 0.4, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY },   // 9점 (40%)
          { radius: 0.6, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY },   // 8점 (60%)
          { radius: 0.8, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY },   // 7점 (80%)
          { radius: 1.0, color: WA_COLORS.CERULEAN_BLUE, stroke: WA_COLORS.DARK_GRAY }   // 6점 (100%)
        ]
        break

      case 'wa_vertical_3_spot':
      case 'wa_horizontal_3_spot': {
        // 3-스팟 렌더링: WA 6 Ring 스타일의 작은 과녁 3개
        // 배경을 흰색으로 그리기
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const centerX = 400
        const centerY = 400
        const radius = 400

        const spotCenters = session.target_type === 'wa_vertical_3_spot'
          ? [
              { x: centerX, y: 800 * 0.25 },
              { x: centerX, y: centerY },
              { x: centerX, y: 800 * 0.75 },
            ]
          : [
              { x: 800 * 0.25, y: centerY },
              { x: centerX, y: centerY },
              { x: 800 * 0.75, y: centerY },
            ]

        const wa6 = [
          { r: 0.084, c: WA_COLORS.LEMON_YELLOW },
          { r: 0.166, c: WA_COLORS.LEMON_YELLOW },
          { r: 0.334, c: WA_COLORS.LEMON_YELLOW },
          { r: 0.5,   c: WA_COLORS.FLAMINGO_RED },
          { r: 0.666, c: WA_COLORS.FLAMINGO_RED },
          { r: 0.834, c: WA_COLORS.CERULEAN_BLUE },
          { r: 1.0,   c: WA_COLORS.CERULEAN_BLUE },
        ]

        const spotRadius = radius * 0.22

        // 3-스팟 그리기
        spotCenters.forEach((c) => {
          for (let i = wa6.length - 1; i >= 0; i--) {
            const rr = spotRadius * wa6[i].r
            ctx.beginPath()
            ctx.arc(c.x, c.y, rr, 0, 2 * Math.PI)
            ctx.fillStyle = wa6[i].c
            ctx.fill()
            ctx.strokeStyle = WA_COLORS.DARK_GRAY
            ctx.lineWidth = 2
            ctx.stroke()
          }
        })

        // 3-스팟 위에 화살 표시
        shots.forEach((shot) => {
          const x = shot.x
          const y = shot.y
          
          // 좌표가 없는 경우 화살을 그리지 않음
          if (x === 0 && y === 0) {
            // console.log(`⚠️ (3-스팟) 화살 ${shot.id}번의 좌표가 없습니다`)
            return
          }
          
          // console.log(`🎯 (3-스팟) 화살 ${shot.id}번 그리기: (x: ${x}, y: ${y})`)
          
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, 2 * Math.PI)
          ctx.fillStyle = '#FF0000'
          ctx.fill()
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // 화살 번호 표시 (흰색 텍스트 + 검은색 테두리)
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 3
          ctx.strokeText(shot.id.toString(), x, y)
          ctx.fillStyle = '#FFF'
          ctx.fillText(shot.id.toString(), x, y)
        })

        return
      }
      case 'wa_vertical_5_spot':
      case 'wa_horizontal_5_spot':
      case 'wa_vertical_1_spot':
      case 'wa_horizontal_1_spot':
      default:
        // WA Full 타겟 (기본값)
        zones = [
          { radius: 0.05, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY }, // 10점 (중앙)
          { radius: 0.1, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY },  // 10점
          { radius: 0.21, color: WA_COLORS.LEMON_YELLOW, stroke: WA_COLORS.DARK_GRAY },  // 9점
          { radius: 0.31, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY },  // 8점
          { radius: 0.415, color: WA_COLORS.FLAMINGO_RED, stroke: WA_COLORS.DARK_GRAY },  // 7점
          { radius: 0.51, color: WA_COLORS.CERULEAN_BLUE, stroke: WA_COLORS.DARK_GRAY }, // 6점
          { radius: 0.61, color: WA_COLORS.CERULEAN_BLUE, stroke: WA_COLORS.DARK_GRAY }, // 5점
          { radius: 0.71, color: WA_COLORS.BLACK, stroke: WA_COLORS.DARK_GRAY },         // 4점
          { radius: 0.81, color: WA_COLORS.BLACK, stroke: WA_COLORS.DARK_GRAY },         // 3점
          { radius: 0.91, color: WA_COLORS.WHITE, stroke: WA_COLORS.DARK_GRAY },         // 2점
          { radius: 1.0, color: WA_COLORS.WHITE, stroke: WA_COLORS.DARK_GRAY }          // 1점
        ]
        break
    }

    // 바깥쪽부터 안쪽으로 그리기
    for (let i = zones.length - 1; i >= 0; i--) {
      const zone = zones[i]
      const ringRadius = radius * zone.radius
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI)
      ctx.fillStyle = zone.color
      ctx.fill()
      ctx.strokeStyle = zone.stroke
      ctx.lineWidth = 2
      ctx.stroke()
    }


    // 기존 화살 표시
    shots.forEach((shot) => {
      const x = shot.x
      const y = shot.y
      
      // 좌표가 없는 경우 화살을 그리지 않음
      if (x === 0 && y === 0) {
        // console.log(`⚠️ 화살 ${shot.id}번의 좌표가 없습니다 (x: ${x}, y: ${y})`)
        return
      }
      
      // console.log(`🎯 화살 ${shot.id}번 그리기: (x: ${x}, y: ${y})`)
      
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, 2 * Math.PI)
      ctx.fillStyle = '#FF0000'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 화살 번호 표시 (흰색 텍스트 + 검은색 테두리)
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.strokeText(shot.id.toString(), x, y)
      ctx.fillStyle = '#FFF'
      ctx.fillText(shot.id.toString(), x, y)
    })

  }, [shots, session.target_type, currentRound, isLoading])


  // 점수에 따른 배경색 반환 함수 (X, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 구성)
  const getScoreBackgroundColor = (score: number, scoringRing: number): { className: string; style: React.CSSProperties } => {
    // console.log('🎨 getScoreBackgroundColor 호출:', { score, scoringRing })
    
    if (score === 0) {
      // console.log('🎨 M 색상: bg-white')
      return { className: 'bg-white', style: { backgroundColor: '#ffffff' } } // M은 흰색 배경
    }

    // X, 10, 9점: 노란색
    if (score === 10 && scoringRing === 0) {
      // console.log('🎨 X 색상: bg-yellow-300')
      return { className: 'bg-yellow-300', style: { backgroundColor: '#fde047' } } // X - LEMON_YELLOW
    }
    if (score === 10 && scoringRing === 1) {
      // console.log('🎨 10점 색상: bg-yellow-300')
      return { className: 'bg-yellow-300', style: { backgroundColor: '#fde047' } } // 10점 - LEMON_YELLOW
    }
    if (score === 9) {
      // console.log('🎨 9점 색상: bg-yellow-300')
      return { className: 'bg-yellow-300', style: { backgroundColor: '#fde047' } } // 9점 - LEMON_YELLOW
    }

    // 8, 7점: 빨간색
    if (score === 8) {
      // console.log('🎨 8점 색상: bg-red-400')
      return { className: 'bg-red-400', style: { backgroundColor: '#f87171' } } // 8점 - FLAMINGO_RED
    }
    if (score === 7) {
      // console.log('🎨 7점 색상: bg-red-400')
      return { className: 'bg-red-400', style: { backgroundColor: '#f87171' } } // 7점 - FLAMINGO_RED
    }

    // 6, 5점: 파란색
    if (score === 6) {
      // console.log('🎨 6점 색상: bg-blue-400')
      return { className: 'bg-blue-400', style: { backgroundColor: '#60a5fa' } } // 6점 - CERULEAN_BLUE
    }
    if (score === 5) {
      // console.log('🎨 5점 색상: bg-blue-400')
      return { className: 'bg-blue-400', style: { backgroundColor: '#60a5fa' } } // 5점 - CERULEAN_BLUE
    }

    // 4, 3점: 검은색
    if (score === 4) {
      // console.log('🎨 4점 색상: bg-black')
      return { className: 'bg-black', style: { backgroundColor: '#000000' } } // 4점 - BLACK
    }
    if (score === 3) {
      // console.log('🎨 3점 색상: bg-black')
      return { className: 'bg-black', style: { backgroundColor: '#000000' } } // 3점 - BLACK
    }

    // 2, 1점: 흰색
    if (score === 2) {
      // console.log('🎨 2점 색상: bg-white')
      return { className: 'bg-white', style: { backgroundColor: '#ffffff' } } // 2점 - WHITE
    }
    if (score === 1) {
      // console.log('🎨 1점 색상: bg-white')
      return { className: 'bg-white', style: { backgroundColor: '#ffffff' } } // 1점 - WHITE
    }

    // console.log('🎨 기본 색상: bg-gray-50')
    return { className: 'bg-gray-50', style: { backgroundColor: '#f9fafb' } } // 기본값
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">기존 점수를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 녹색 헤더 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-center">
          <div className="text-xl font-bold"></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-6">
          {/* 좌측: 점수 표시 */}
          <div className="bg-white rounded-lg p-6">
            {/* 뒤로 가기 버튼과 삭제 버튼 */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => {
                  console.log('뒤로 가기 버튼 클릭됨')
                  if (onBack) {
                    onBack()
                  } else {
                    navigate('/trainings')
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
              >
                <ArrowLeft size={18} />
                <span className="font-medium">뒤로 가기</span>
              </button>
              <div className="flex items-center space-x-2">
                {shots.length > 0 && (
                  <button
                    onClick={handleUndoLastShot}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    style={{ border: 'none', outline: 'none' }}
                  >
                    <X size={18} />
                    <span className="font-medium">마지막 삭제</span>
                  </button>
                )}
                {(isComplete || shots.length === arrowCount) && (
                  <button
                    onClick={handleNextEnd}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    style={{ border: 'none', outline: 'none' }}
                  >
                    <span className="font-medium">다음 End</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* 점수 표 - 이미지 형식 */}
            <div className="mb-6">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                {/* End 헤더 */}
                <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">End {currentRound}</span>
                    <span className="text-lg font-bold text-gray-800">
                      {cumulativeScore}/{currentRound * arrowCount * 10}
                    </span>
                  </div>
                </div>
                
                {/* 화살 점수 가로 배치 - End 1과 0/60 길이로 등분 */}
                <div className="p-4">
                  <div className="flex justify-center" style={{ width: '100%' }}>
                    {Array.from({ length: arrowCount }, (_, index) => {
                      const shot = shots[index]
                      const colorInfo = shot ? (shot.score === 0 ? { className: 'bg-white', style: { backgroundColor: '#ffffff' } } : getScoreBackgroundColor(shot.score, shot.scoringRing)) : { className: 'bg-gray-50', style: { backgroundColor: '#f9fafb' } }
                      const textColor = shot
                        ? (shot.score === 0 || shot.score === 1 || shot.score === 2)
                          ? 'text-black'
                          : 'text-white'
                        : 'text-gray-400'
                      const displayText = shot ? (shot.score === 0 ? 'M' : (shot.score === 10 && shot.scoringRing === 0 ? 'X' : shot.score)) : '-'
                      
                      
                      return (
                        <div 
                          key={index}
                          className={`flex-1 h-16 flex items-center justify-center border border-gray-300 rounded mx-1 ${colorInfo.className}`}
                          style={{ minWidth: '60px', ...colorInfo.style }}
                        >
                          <span className={`text-2xl font-bold ${textColor}`}>
                            {displayText}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 타겟 */}
          <div className="bg-white rounded-lg p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">과녁</h2>
              {shots.length < arrowCount && (
                <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm">
                  화살 {shots.length + 1}번을 클릭하세요
                </div>
              )}
            </div>
            <div className="flex flex-col items-center relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  onClick={handleCanvasClick}
                  className="border border-gray-300 rounded-lg cursor-crosshair hover:border-gray-400 transition-colors"
                  style={{ 
                    touchAction: 'none',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              {isComplete && (
                <div className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                  모든 화살 완료! "다음 End" 버튼을 눌러 저장하세요
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
