'use client'

import { useState, useCallback } from 'react'
import { solveSpellingBee, SolverResult } from '@/lib/solver'

export default function Home() {
  const [letters, setLetters] = useState<string[]>(Array(7).fill(''))
  const [centerIndex, setCenterIndex] = useState<number>(0)
  const [result, setResult] = useState<SolverResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleLetterChange = (index: number, value: string) => {
    const upper = value.slice(-1).toUpperCase()
    if (upper && !/^[A-Z]$/.test(upper)) return
    const next = [...letters]
    next[index] = upper
    setLetters(next)
    setResult(null)
    setError('')
  }

  const handleSolve = useCallback(() => {
    setError('')
    const filled = letters.filter((l) => l !== '')
    if (filled.length !== 7) {
      setError('Please enter all 7 letters.')
      return
    }
    if (new Set(filled).size !== 7) {
      setError('All 7 letters must be unique.')
      return
    }
    const required = letters[centerIndex]
    const res = solveSpellingBee(letters, required)
    setResult(res)
  }, [letters, centerIndex])

  const handleClear = () => {
    setLetters(Array(7).fill(''))
    setResult(null)
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleSolve()
    }
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      const prev = document.getElementById(`letter-${index - 1}`) as HTMLInputElement
      prev?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-bee-dark text-white font-sans">
      {/* Header */}
      <header className="border-b border-bee-border bg-bee-panel">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Spelling Bee <span className="text-bee-yellow">Solver</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              AI-powered helper for the NYT Spelling Bee puzzle
            </p>
          </div>
          <a
            href="https://www.nytimes.com/puzzles/spelling-bee"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block text-xs font-semibold text-bee-yellow hover:text-bee-gold transition-colors"
          >
            Open NYT Puzzle ↗
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Input Section */}
        <section className="bg-bee-panel border border-bee-border rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold mb-5">Enter Your Letters</h2>

          {/* Center Letter Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Select Center (Required) Letter
            </label>
            <div className="flex gap-2 flex-wrap">
              {letters.map((l, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCenterIndex(i)
                    setResult(null)
                  }}
                  disabled={!l}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    centerIndex === i
                      ? 'bg-bee-yellow text-bee-dark shadow-lg shadow-bee-yellow/30'
                      : l
                      ? 'bg-bee-dark border border-bee-border text-white hover:border-gray-500'
                      : 'bg-bee-dark border border-bee-border text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {l || '—'}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Inputs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              All 7 Letters
            </label>
            <div className="flex gap-3 flex-wrap">
              {letters.map((l, i) => (
                <div key={i} className="relative">
                  <input
                    id={`letter-${i}`}
                    type="text"
                    maxLength={1}
                    value={l}
                    onChange={(e) => handleLetterChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className={`w-14 h-14 text-center text-2xl font-black rounded-xl border-2 bg-bee-dark outline-none transition-all uppercase ${
                      centerIndex === i
                        ? 'border-bee-yellow text-bee-yellow shadow-lg shadow-bee-yellow/20'
                        : 'border-bee-border text-white focus:border-gray-500'
                    }`}
                    placeholder="?"
                  />
                  {centerIndex === i && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-bee-yellow text-bee-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      CTR
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSolve}
              className="flex-1 bg-bee-yellow hover:bg-bee-gold text-bee-dark font-bold px-6 py-3 rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Solve Puzzle
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-3 rounded-xl font-semibold text-sm border border-bee-border text-gray-400 hover:text-white hover:border-gray-500 transition-all"
            >
              Clear
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-sm font-medium">{error}</p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Words Found" value={result.wordCount} />
              <StatCard label="Pangrams" value={result.pangramCount} />
              <StatCard label="Total Score" value={result.totalScore} />
              <StatCard
                label="Max Possible"
                value={result.words.filter((w) => w.isPangram).length > 0 ? 'Queen Bee 🐝' : '—'}
              />
            </div>

            {/* Pangrams */}
            {result.pangrams.length > 0 && (
              <div className="bg-bee-panel border border-bee-yellow/30 rounded-2xl p-6">
                <h3 className="text-bee-yellow font-bold text-lg mb-4 flex items-center gap-2">
                  <span>🐝</span> Pangrams
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.pangrams.map((w) => (
                    <WordBadge key={w.word} word={w} highlight />
                  ))}
                </div>
              </div>
            )}

            {/* All Words */}
            <div className="bg-bee-panel border border-bee-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                All Words ({result.wordCount})
              </h3>
              {result.words.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No words found with these letters.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {result.words.map((w) => (
                    <WordBadge key={w.word} word={w} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-bee-border bg-bee-panel mt-12">
        <div className="max-w-3xl mx-auto px-6 py-5 text-center text-xs text-gray-500">
          Not affiliated with The New York Times. For educational purposes only.
        </div>
      </footer>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bee-panel border border-bee-border rounded-xl p-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>
  )
}

function WordBadge({
  word,
  highlight = false,
}: {
  word: { word: string; length: number; score: number }
  highlight?: boolean
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-sm font-semibold text-center transition-all ${
        highlight
          ? 'bg-bee-yellow/10 text-bee-yellow border border-bee-yellow/30'
          : 'bg-bee-dark text-gray-300 border border-bee-border hover:border-gray-500'
      }`}
      title={`${word.length} letters · ${word.score} pts`}
    >
      {word.word}
      <span className="ml-1.5 text-[10px] opacity-60">{word.score}pts</span>
    </div>
  )
}
