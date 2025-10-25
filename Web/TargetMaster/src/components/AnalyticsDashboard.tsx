import { useState, useEffect } from 'react'

interface AnalyticsData {
  basicStatistics: {
    totalTrainings: number
    totalShots: number
    averageScore: number
    accuracy: number
    scoreDistribution: {
      '10점': number
      '9점': number
      '8점': number
      '7점': number
      '6점 이하': number
    }
  }
  accuracyAnalysis: {
    accuracyByDate: Record<string, number>
    averageAccuracy: number
  }
  improvementTrend: {
    trend: string
    improvement: number
    improvementPercentage: number
    firstHalfAverage: number
    secondHalfAverage: number
  }
  shotPattern: {
    centerPoint: { x: number; y: number }
    variance: { x: number; y: number }
    consistency: number
    totalShots: number
  }
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: '', organization: '' })

  useEffect(() => {
    // 사용자 정보 가져오기
    const userName = localStorage.getItem('userName') || ''
    const userOrganization = localStorage.getItem('userOrganization') || ''
    setUserInfo({ name: userName, organization: userOrganization })
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // 임시 데이터 (실제로는 API 호출)
      const mockData: AnalyticsData = {
        basicStatistics: {
          totalTrainings: 15,
          totalShots: 450,
          averageScore: 8.2,
          accuracy: 78.5,
          scoreDistribution: {
            '10점': 45,
            '9점': 89,
            '8점': 123,
            '7점': 98,
            '6점 이하': 95
          }
        },
        accuracyAnalysis: {
          accuracyByDate: {},
          averageAccuracy: 78.5
        },
        improvementTrend: {
          trend: 'improving',
          improvement: 2.3,
          improvementPercentage: 3.1,
          firstHalfAverage: 7.8,
          secondHalfAverage: 8.1
        },
        shotPattern: {
          centerPoint: { x: 0.2, y: -0.1 },
          variance: { x: 1.2, y: 1.1 },
          consistency: 0.78,
          totalShots: 450
        }
      }
      
      setTimeout(() => {
        setAnalyticsData(mockData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('분석 데이터 조회 오류:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600">📈</span>
      case 'declining':
        return <span className="text-red-600">📉</span>
      default:
        return <span className="text-gray-600">➡️</span>
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '개선 중'
      case 'declining':
        return '하락 중'
      default:
        return '안정적'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">분석 데이터가 없습니다</h3>
        <p className="text-gray-500 mb-4">훈련 기록을 추가한 후 분석을 확인해보세요.</p>
        <button onClick={fetchAnalytics} className="btn-modern">분석 새로고침</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">대시보드</h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-4">양궁 훈련 현황과 최근 기록을 확인하세요</p>
              {userInfo.name && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {userInfo.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        안녕하세요, <span className="text-blue-600">{userInfo.name}</span>님! 👋
                      </p>
                      {userInfo.organization && (
                        <p className="text-sm text-gray-600">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🏢 {userInfo.organization}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-row gap-6 lg:flex-shrink-0">
              <button 
                onClick={fetchAnalytics} 
                disabled={loading}
                className="btn-modern flex items-center justify-center space-x-2 px-6 py-3 whitespace-nowrap"
              >
                <span>📅</span>
                <span>새 훈련 기록</span>
              </button>
            </div>
          </div>
        </div>

        {/* 통계 카드들 - 가로 배치 */}
        <div className="flex flex-row gap-6 mb-8">
          <div className="modern-card p-8 text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">총 훈련 횟수</h3>
            <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">{analyticsData.basicStatistics.totalTrainings}</div>
            <p className="text-base text-gray-500">회</p>
          </div>

          <div className="modern-card p-8 text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">평균 점수</h3>
            <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">{analyticsData.basicStatistics.averageScore.toFixed(1)}</div>
            <p className="text-base text-gray-500">점</p>
          </div>

          <div className="modern-card p-8 text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">최고 점수</h3>
            <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">{analyticsData.basicStatistics.totalShots}</div>
            <p className="text-base text-gray-500">점</p>
          </div>

        </div>



      </div>
    </div>
  )
}
