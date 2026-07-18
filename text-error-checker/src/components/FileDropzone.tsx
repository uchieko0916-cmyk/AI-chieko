import { useCallback, useRef, useState } from 'react'
import { SUPPORTED_EXTENSIONS } from '../lib/extractors'

interface Props {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export function FileDropzone({ onFileSelected, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (file) onFileSelected(file)
    },
    [onFileSelected],
  )

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      } ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <p className="text-lg font-medium text-gray-700">
        ファイルをドラッグ＆ドロップ、またはクリックして選択
      </p>
      <p className="mt-2 text-sm text-gray-500">
        対応形式: {SUPPORTED_EXTENSIONS.join(' / ')}
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={SUPPORTED_EXTENSIONS.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
