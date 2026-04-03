"use client"

import { Fragment } from "react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  type?: "danger" | "warning" | "info"
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "danger"
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        }
      case "warning":
        return {
          icon: "text-yellow-600",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        }
      case "info":
        return {
          icon: "text-blue-600",
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
      default:
        return {
          icon: "text-red-600",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}