"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"
import "../admin.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  label: string
  required?: boolean
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  label,
  required,
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      // Custom styling for better appearance
      quill.root.style.minHeight = "200px"
      quill.root.style.fontSize = "14px"
      quill.root.style.fontFamily = "inherit"
    }
  }, [])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <ReactQuill
          // ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          theme="snow"
          style={{
            backgroundColor: "white",
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}