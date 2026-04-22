"use client"

import { useState } from "react"
import PlaylistManager from "./PlaylistManager"

const tabs = [
  { id: "hero" as const,                        name: "Hero Playlist" },
  { id: "other-stories" as const,               name: "Other Stories" },
  { id: "industales" as const,                  name: "IndusTales Featured" },
  { id: "industales-other-stories" as const,    name: "IndusTales Other Stories" },
]

export default function PlaylistTabs() {
  const [activeTab, setActiveTab] = useState<"hero" | "other-stories" | "industales" | "industales-other-stories">("hero")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm self-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            }
          >
            {tab.name}
          </button>
        ))}
      </div>

      <PlaylistManager type={activeTab} />
    </div>
  )
}
