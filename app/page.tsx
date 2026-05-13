'use client'

import { useState, useCallback } from 'react'

const POSITIONS = [
  { label: 'top-left', row: 0, col: 0 },
  { label: 'top-right', row: 0, col: 1 },
  { label: 'middle-left', row: 1, col: 0 },
  { label: 'center', row: 1, col: 1 },
  { label: 'middle-right', row: 1, col: 2 },
  { label: 'bottom-left', row: 2, col: 0 },
  { label: 'bottom-right', row: 2, col: 1 },
]

// Honeycomb hex positions: 3 outer top, center, 3 outer bottom
// Rendered as a CSS grid approximating the NYT hex layout
const HEX_LAYOUT = [
  [0, 1, null],   // row 0: positions 0, 1
  [2, 3, 4],      // row 1: positions 2, center(3), 4
  [null, 5, 6],   // row 2: positions 5, 6
]

export default function Home() {
  const [letters, setLetters] = useState<string[]>(Array(7).fill(''))
  const [requiredIndex, setRequiredIndex] = useState<number>(3) // center by default
  const [words, setWords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'length' | 'alpha'>('length')

  const handleLetterChange = useCallback((index: number, value: string) => {
    const char = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, '')
    setLetters((prev) => {
      const next = [...prev]
      next[index] = char
      return next
    })
  }, [])

  const handleSolve = useCallback(async () => {
    const filled = letters.filter((l) => l.trim() !== '')
    if (filled.length !== 7) {
      setError('Please fill in all 7 letters.')
      return
    }
    setError(null)
    setLoading(true)
    setWords([])
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letters: letters.map((l) => l.toUpperCase()),
          requiredLetter: letters[requiredIndex],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')
      const result: string[] = data.words || []
      if (sortBy === 'alpha') {
        result.sort((a, b) => a.localeCompare(b))
      } else {
        result.sort((a, b) => a.length - b.length || a.localeCompare(b))
      }
      setWords(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate words')
    } finally {
      setLoading(false)
    }
  }, [letters, requiredIndex, sortBy])

  // Map flat index to hex grid position
  const flatIndex = (row: number, col: number): number | null => {
    const layout = HEX_LAYOUT[row]
    if (!layout) return null
    const val = layout[col]
    return val ?? null
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-block text-xs tracking-widest uppercase mb-4 px-3 py-1"
          style={{
            color: 'var(--primary)',
            border: '1px solid var(--primary-border)',
            background: 'var(--primary-bg)',
            fontFamily: 'var(--font-space-mono)',
          }}
        >
          AI-Powered Tool
        </div>
        <h1
          className="text-5xl font-bold uppercase tracking-tight mb-4"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-funnel-display)' }}
        >
          Spelling Bee Solver
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
          Enter 7 letters. Mark the required center letter. Let AI find every valid word.
        </p>
      </div>

      {/* Honeycomb Input Grid */}
      <div className="mb-10">
        <p
          className="text-center text-sm uppercase tracking-widest mb-6"
          style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
        >
          Click any hex to mark as center letter
        </p>
        <div className="flex flex-col items-center gap-1">
          {HEX_LAYOUT.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1" style={{ marginLeft: rowIdx === 1 ? '0' : '42px' }}>
              {row.map((cellIdx, colIdx) => {
                if (cellIdx === null) return <div key={colIdx} style={{ width: '80px' }} />
                const isCenter = cellIdx === requiredIndex
                const letter = letters[cellIdx]
                return (
                  <HexCell
                    key={cellIdx}
                    isCenter={isCenter}
                    letter={letter}
                    onChange={(val) => handleLetterChange(cellIdx, val)}
                    onSelect={() => setRequiredIndex(cellIdx)}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <p
          className="text-center text-xs mt-4"
          style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
        >
          Center:{' '}
          <span style={{ color: 'var(--primary)' }}>
            {letters[requiredIndex] || '?'}
          </span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
          >
            Sort
          </span>
          <button
            onClick={() => setSortBy('length')}
            className="px-3 py-1 text-xs uppercase tracking-widest transition-colors"
            style={{
              fontFamily: 'var(--font-space-mono)',
              background: sortBy === 'length' ? 'var(--primary-bg)' : 'transparent',
              color: sortBy === 'length' ? 'var(--primary)' : 'var(--foreground-subtle)',
              border: `1px solid ${sortBy === 'length' ? 'var(--primary-border)' : 'var(--border)'}`,
            }}
          >
            Length
          </button>
          <button
            onClick={() => setSortBy('alpha')}
            className="px-3 py-1 text-xs uppercase tracking-widest transition-colors"
            style={{
              fontFamily: 'var(--font-space-mono)',
              background: sortBy === 'alpha' ? 'var(--primary-bg)' : 'transparent',
              color: sortBy === 'alpha' ? 'var(--primary)' : 'var(--foreground-subtle)',
              border: `1px solid ${sortBy === 'alpha' ? 'var(--primary-border)' : 'var(--border)'}`,
            }}
          >
            A–Z
          </button>
        </div>

        <button
          onClick={handleSolve}
          disabled={loading}
          className="px-8 py-3 text-sm uppercase tracking-widest font-medium transition-all"
          style={{
            fontFamily: 'var(--font-space-mono)',
            background: loading ? 'var(--primary-bg)' : 'var(--primary)',
            color: loading ? 'var(--primary)' : '#000000',
            border: `1px solid ${loading ? 'var(--primary-border)' : 'var(--primary)'}`,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating…' : 'Find Words'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 px-4 py-3 text-sm"
          style={{
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            fontFamily: 'var(--font-space-mono)',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="mb-6 text-sm uppercase tracking-widest animate-pulse"
          style={{ color: 'var(--primary)', fontFamily: 'var(--font-space-mono)' }}
        >
          AI is finding your words…
        </div>
      )}

      {/* Results */}
      {words.length > 0 && !loading && (
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm uppercase tracking-widest"
              style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
            >
              {words.length} word{words.length !== 1 ? 's' : ''} found
            </h2>
          </div>
          <div
            className="grid gap-px"
            style={{ border: '1px solid var(--border)', background: 'var(--border)' }}
          >
            {words.map((word, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
                style={{ background: 'var(--surface)' }}
              >
                <span
                  className="text-base font-medium tracking-wide"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-funnel-display)' }}
                >
                  {word}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
                >
                  {word.length} letters
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-16 text-xs text-center"
        style={{ color: 'var(--foreground-subtle)', fontFamily: 'var(--font-space-mono)' }}
      >
        Built with Claude AI · Overclock Accelerator
      </div>
    </main>
  )
}

interface HexCellProps {
  isCenter: boolean
  letter: string
  onChange: (val: string) => void
  onSelect: () => void
}

function HexCell({ isCenter, letter, onChange, onSelect }: HexCellProps) {
  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      onClick={onSelect}
      style={{
        width: '80px',
        height: '88px',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: isCenter ? 'var(--primary)' : 'var(--surface)',
        transition: 'background 0.15s',
      }}
    >
      <input
        type="text"
        maxLength={2}
        value={letter}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="w-12 text-center text-2xl font-bold uppercase outline-none bg-transparent"
        style={{
          color: isCenter ? '#000000' : 'var(--primary)',
          fontFamily: 'var(--font-funnel-display)',
          caretColor: isCenter ? '#000000' : 'var(--primary)',
        }}
        placeholder="·"
      />
    </div>
  )
}
