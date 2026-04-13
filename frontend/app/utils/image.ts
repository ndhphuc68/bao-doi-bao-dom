/** Chuyển data URL (base64) từ FileReader → File để gửi multipart lên API */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const parts = dataUrl.split(',')
  if (parts.length < 2) {
    throw new Error('Data URL không hợp lệ')
  }
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch?.[1] ?? 'image/jpeg'
  const binary = atob(parts[1])
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mime })
}
