import { useMemo, useState } from 'react'
import { FileDropzone } from './components/FileDropzone'
import { ResultList } from './components/ResultList'
import { extractDocument, UnsupportedFileTypeError } from './lib/extractors'
import { checkDocument } from './lib/checker'
import type { Finding } from './types'

export default function App() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => {
    if (!findings) return null
    return {
      error: findings.filter((f) => f.severity === 'error').length,
      warning: findings.filter((f) => f.severity === 'warning').length,
      info: findings.filter((f) => f.severity === 'info').length,
    }
  }, [findings])

  async function handleFileSelected(file: File) {
    setIsLoading(true)
    setError(null)
    setFindings(null)
    setFileName(file.name)

    try {
      const doc = await extractDocument(file)
      setFindings(checkDocument(doc))
    } catch (e) {
      if (e instanceof UnsupportedFileTypeError) {
        setError(e.message)
      } else {
        setError('ファイルの読み込み中にエラーが発生しました。')
        console.error(e)
      }
      setFileName(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">誤字脱字チェッカー</h1>
        <p className="mt-2 text-gray-600">
          ファイルを添付するだけで、ルールベースに誤字脱字・表記ゆれをチェックします。
        </p>
      </header>

      <FileDropzone onFileSelected={handleFileSelected} disabled={isLoading} />

      {isLoading && (
        <p className="mt-6 text-center text-gray-600">チェック中...</p>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-red-700">
          {error}
        </p>
      )}

      {findings && summary && (
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-800">{fileName} のチェック結果</h2>
            <div className="flex gap-3 text-sm text-gray-600">
              <span>誤り: {summary.error}</span>
              <span>要確認: {summary.warning}</span>
              <span>提案: {summary.info}</span>
            </div>
          </div>
          <ResultList findings={findings} />
        </section>
      )}
    </div>
  )
}
