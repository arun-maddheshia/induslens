"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
  disabled?: boolean
  labels: Map<string, string>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used inside <Select>")
  return ctx
}

// ─── Select (Root) ────────────────────────────────────────────────────────────

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null!)
  // Shared labels map — items register themselves here on every render
  const labels = React.useRef(new Map<string, string>()).current

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRef, disabled, labels }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ─── SelectTrigger ────────────────────────────────────────────────────────────

function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen, triggerRef, disabled } = useSelect()

  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm transition-colors outline-none",
        "hover:border-gray-300",
        "focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
        open && "border-gray-400 ring-2 ring-gray-200",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("size-4 shrink-0 text-gray-400 transition-transform duration-150", open && "rotate-180")} />
    </button>
  )
}

// ─── SelectValue ──────────────────────────────────────────────────────────────

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labels } = useSelect()
  const resolved = value ? (labels.get(value) ?? null) : null

  if (!resolved) {
    return <span className="truncate flex-1 text-left text-gray-400">{placeholder}</span>
  }
  return <span className="truncate flex-1 text-left text-gray-900">{resolved}</span>
}

// ─── SelectContent ────────────────────────────────────────────────────────────

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen, triggerRef } = useSelect()
  const [rect, setRect] = React.useState<DOMRect | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }, [open, triggerRef])

  React.useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        contentRef.current && !contentRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, setOpen, triggerRef])

  const style: React.CSSProperties = rect
    ? { position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }
    : { position: "fixed", zIndex: 9999, visibility: "hidden" }

  return (
    <>
      {/* Hidden render so SelectItems register their labels on mount, enabling SelectValue to resolve them before the dropdown is opened */}
      <div style={{ display: "none" }} aria-hidden="true">{children}</div>
      {open && mounted && createPortal(
        <div
          ref={contentRef}
          style={style}
          className={cn(
            "max-h-60 overflow-y-auto rounded-lg border border-gray-100 bg-white p-1 shadow-lg",
            className
          )}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── SelectItem ───────────────────────────────────────────────────────────────

function SelectItem({
  value,
  children,
  className,
  disabled,
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const { value: selectedValue, onValueChange, setOpen, labels } = useSelect()
  const isSelected = selectedValue === value

  // Register label so SelectValue can display it even when dropdown is closed
  const textContent = typeof children === "string" ? children : React.Children.toArray(children).map(c => typeof c === "string" ? c : "").join("")
  labels.set(value, textContent || String(value))

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // prevent trigger blur
      onClick={() => {
        if (!disabled) {
          onValueChange(value)
          setOpen(false)
        }
      }}
      className={cn(
        "relative flex w-full items-center rounded-md py-1.5 pl-2 pr-8 text-left text-sm outline-none transition-colors",
        "hover:bg-gray-100",
        isSelected && "bg-gray-50 font-medium",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="flex-1 truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex size-4 items-center justify-center">
          <Check className="size-3.5 text-gray-700" />
        </span>
      )}
    </button>
  )
}

// ─── SelectGroup / SelectLabel / SelectSeparator ──────────────────────────────

function SelectGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-1", className)}>{children}</div>
}

function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-2 py-1.5 text-xs font-semibold text-gray-500", className)}>{children}</div>
}

function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-gray-100", className)} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
