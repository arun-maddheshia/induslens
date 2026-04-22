"use client"

import { useState } from "react"
import PlaylistManager from "./PlaylistManager"

export default function PlaylistTabs() {
  const [activeTab, setActiveTab] = useState<'hero' | 'other-stories' | 'industales'>('hero')

  const tabs = [
    { id: 'hero' as const, name: 'Hero Playlist', icon: '⭐' },
    { id: 'other-stories' as const, name: 'Other Stories', icon: '📰' },
    { id: 'industales' as const, name: 'IndusTales', icon: '🇮🇳' },
  ]

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex items-center space-x-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Playlist Content */}
      <div className="bg-white rounded-lg shadow">
        <PlaylistManager type={activeTab} />
      </div>
    </>
  )
}