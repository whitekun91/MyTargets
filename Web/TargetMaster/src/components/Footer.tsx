import { useState } from 'react'

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-auto mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* 로고 */}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gradient">TargetMaster</span>
          </div>

          {/* 저작권 */}
          <div className="text-sm text-gray-500">
            Copyright © {currentYear} TargetMaster. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
