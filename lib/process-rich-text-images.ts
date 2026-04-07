
export async function processRichTextImages(
  html: string,
  uploadType: string
): Promise<string> {
  // Match <img src="data:image/TYPE;base64,DATA"> — captures the full data URL,
  // the image MIME subtype (e.g. "png"), and the raw base64 string.
  const base64Regex = /src="(data:image\/([a-zA-Z]+);base64,([^"]+))"/g
  const matches: RegExpExecArray[] = []
  let m: RegExpExecArray | null
  while ((m = base64Regex.exec(html)) !== null) {
    matches.push(m)
  }

  if (matches.length === 0) return html

  let processedHtml = html

  for (const match of matches) {
    const [, dataUrl, mimeSubtype, base64Data] = match

    try {
      const byteString = atob(base64Data)
      const bytes = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i)
      }
      const mimeType = `image/${mimeSubtype}`
      const file = new File([bytes], `inline-image.${mimeSubtype}`, { type: mimeType })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", "inline-images")
      formData.append("type", uploadType)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) continue 

      const { filePath } = await res.json()
      processedHtml = processedHtml.replace(dataUrl, filePath)
    } catch {
    }
  }

  return processedHtml
}
