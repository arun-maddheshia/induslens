"use client"

import React, { useMemo, useRef } from "react"
import dynamic from "next/dynamic"


const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill")
    const Quill = (await import("quill")).default

    const Image = Quill.import("formats/image") as any
    Image.sanitize = (url: string) => url 
    Quill.register(Image, true)

    const ForwardedRQ = React.forwardRef<any, any>((props, ref) => <RQ {...props} ref={ref} />)
    ForwardedRQ.displayName = "ReactQuill"
    return ForwardedRQ
  },
  { ssr: false }
)
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  error,
  label,
  required,
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`border rounded-lg overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 ${
          error
            ? "border-red-400"
            : "border-gray-300 focus-within:border-indigo-500"
        }`}
      >
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          theme="snow"
          style={{ backgroundColor: "white" }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
