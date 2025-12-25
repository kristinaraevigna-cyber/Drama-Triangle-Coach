'use client'

import Link from 'next/link'
import { useState } from 'react'

interface JournalEntry {
  id: number
  date: Date
  mood: string
  moodScore: number
  dramaRole: string | null
  compassionRole: string | null
  situation: string
  reflection: string
  gratitude: string[]
  actionTaken: string
  wins: string
}

const MOODS = [
  { emoji: '😊', label: 'Great', score: 5, color: '#3D5A4C' },
  { emoji: '🙂', label: 'Good', score: 4, color: '#6B8E6B' },
  { emoji: '😐', label: 'Okay', score: 3, color: '#B8A038' },
  { emoji: '😔', label: 'Low', score: 2, color: '#C97B4B' },
  { emoji: '😢', label: 'Struggling', score: 1, color: '#A85454' },
]

const DRAMA_ROLES = [
  { id: 'victim', label: 'Victim', emoji: '😢', description: 'Felt helpless or "poor me"' },
  { id: 'persecutor', label: 'Persecutor', emoji: '😠', description: 'Blamed or criticized others' },
  { id: 'rescuer', label: 'Rescuer', emoji: '🦸', description: 'Tried to fix or save someone' },
  { id: 'none', label: 'None', emoji: '✨', description: 'Stayed out of drama' },
]

const COMPASSION_ROLES = [
  { id: 'vulnerable', label: 'Vulnerable', emoji: '💚', description: 'Owned my feelings openly' },
  { id: 'assertive', label: 'Assertive', emoji: '💪', description: 'Set boundaries kindly' },
  { id: 'caring', label: 'Caring', emoji: '🤗', description: 'Supported without rescuing' },
  { id: 'none', label: 'Still learning', emoji: '📚', description: 'Working on it' },
]

const PROMPTS = [
  "What triggered you today?",
  "When did you feel most at peace?",
  "What pattern did you notice in yourself?",
  "How did you show up in a difficult moment?",
  "What would you do differently?",
  "What are you learning about yourself?",
  "When did you feel most connected to others?",
  "What boundary did you set or wish you had set?",
]

// Sample past entries
const SAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000), // Yesterday
    mood: '🙂',
    moodScore: 4,
    dramaRole: 'rescuer',
    compassionRole: 'caring',
    situation: 'My coworker was stressed about a deadline',
    reflection: 'I noticed myself wanting to take over their work. Instead, I asked how I could support them without doing it for them.',
    gratitude: ['Supportive partner', 'Good weather', 'Productive morning'],
    actionTaken: 'Asked "How can I help?" instead of jumping in',
    wins: 'Caught myself before rescuing!'
  },
  {
    id: 2,
    date: new Date(Date.now() - 172800000), // 2 days ago
    mood: '😐',
    moodScore: 3,
    dramaRole: 'victim',
    compassionRole: 'vulnerable',
    situation: 'Felt overwhelmed by family expectations',
    reflection: 'Started feeling sorry for myself, then realized I was in Victim mode. Shifted to expressing my needs directly.',
    gratitude: ['My health', 'Morning coffee', 'A good book'],
    actionTaken: 'Told my family I needed space instead of complaining',
    wins: 'Recognized the pattern faster than before'
  },
  {
    id: 3,
    date: new Date(Date.now() - 259200000), // 3 days ago
    mood: '😊',
    moodScore: 5,
    dramaRole: 'none',
    compassionRole: 'assertive',
    situation: 'Had a difficult conversation with my boss',
    reflection: 'Stayed calm and stated my needs clearly. Felt proud of how I handled it.',
    gratitude: ['Career growth', 'Supportive friends', 'Evening walk'],
    actionTaken: 'Used "I" statements throughout the conversation',
    wins: 'Assertive without being aggressive!'
  },
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(SAMPLE_ENTRIES)
  const [isWriting, setIsWriting] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0])
  
  // New entry state
  const [mood, setMood] = useState<string | null>(null)
  const [moodScore, setMoodScore] = useState<number>(0)
  const [dramaRole, setDramaRole] = useState<string | null>(null)
  const [compassionRole, setCompassionRole] = useState<string | null>(null)
  const [situation, setSituation] = useState('')
  const [reflection, setReflection] = useState('')
  const [gratitude1, setGratitude1] = useState('')
  const [gratitude2, setGratitude2] = useState('')
  const [gratitude3, setGratitude3] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [wins, setWins] = useState('')

  const todayEntry = entries.find(e => 
    new Date(e.date).toDateString() === new Date().toDateString()
  )

  const streak = (() => {
    let count = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const hasEntry = entries.some(e => 
        new Date(e.date).toDateString() === checkDate.toDateString()
      )
      if (hasEntry) count++
      else if (i > 0) break // Allow today to not have entry yet
    }
    return count
  })()

  const averageMood = entries.length > 0 
    ? (entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length).toFixed(1)
    : '0'

  const shufflePrompt = () => {
    const newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
    setCurrentPrompt(newPrompt)
  }

  const saveEntry = () => {
    if (!mood) return

    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date(),
      mood,
      moodScore,
      dramaRole,
      compassionRole,
      situation,
      reflection,
      gratitude: [gratitude1, gratitude2, gratitude3].filter(g => g.trim()),
      actionTaken,
      wins
    }

    setEntries([newEntry, ...entries])
    setIsWriting(false)
    resetForm()
  }

  const resetForm = () => {
    setMood(null)
    setMoodScore(0)
    setDramaRole(null)
    setCompassionRole(null)
    setSituation('')
    setReflection('')
    setGratitude1('')
    setGratitude2('')
    setGratitude3('')
    setActionTaken('')
    setWins('')
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex'
    }}>
      
      {/* Sidebar */}
      <div style={{
        width: '16vw',
        minHeight: '100vh',
        backgroundColor: '#3D5A4C',
        padding: '2.5vw 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontSize: '1.3vw',
              fontWeight: 400,
              color: '#ffffff',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.02em'
            }}>
              Drama Triangle
            </h1>
            <p style={{
              fontSize: '1vw',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Georgia, serif',
              marginTop: '0.2vw'
            }}>
              Coach
            </p>
          </Link>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '0 2vw 2vw 2vw'
        }} />

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard', active: false },
            { name: 'Compassion Coach', href: '/coach', active: false },
            { name: 'Mentor Coach', href: '/mentor', active: false },
            { name: 'Learn', href: '/learn', active: false },
            { name: 'Practice', href: '/practice', active: false },
            { name: 'Journal', href: '/journal', active: true },
            { name: 'Progress', href: '/progress', active: false },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              style={{
                display: 'block',
                padding: '1vw 1.5vw',
                marginBottom: '0.3vw',
                borderRadius: '0.4vw',
                backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '1vw',
                fontWeight: item.active ? 500 : 400,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease'
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0 2vw' }}>
          <div style={{
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginBottom: '2vw'
          }} />
          
          {/* Stats */}
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw',
            marginBottom: '1vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8vw' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Streak</p>
                <p style={{ color: '#ffffff', fontSize: '1.2vw', fontWeight: 600, margin: 0 }}>
                  🔥 {streak} days
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Avg Mood</p>
                <p style={{ color: '#ffffff', fontSize: '1.2vw', fontWeight: 600, margin: 0 }}>
                  {averageMood}/5
                </p>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75vw', margin: 0 }}>
              {entries.length} total entries
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '2.5vw',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h1 style={{
              fontSize: '2vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0
            }}>
              Journal
            </h1>
            <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {!isWriting && !todayEntry && (
            <button
              onClick={() => setIsWriting(true)}
              style={{
                padding: '0.8vw 1.5vw',
                fontSize: '1vw',
                backgroundColor: '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              + New Entry
            </button>
          )}
        </div>

        {/* Writing Mode */}
        {isWriting && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            marginBottom: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2vw' }}>
              <h2 style={{
                fontSize: '1.3vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: 0
              }}>
                Today's Reflection
              </h2>
              <button
                onClick={() => { setIsWriting(false); resetForm() }}
                style={{
                  padding: '0.4vw 0.8vw',
                  fontSize: '0.85vw',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '0.3vw',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

            {/* Mood Selection */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.8vw' }}>
                How are you feeling?
              </label>
              <div style={{ display: 'flex', gap: '0.8vw' }}>
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => { setMood(m.emoji); setMoodScore(m.score) }}
                    style={{
                      padding: '1vw 1.5vw',
                      fontSize: '1.5vw',
                      backgroundColor: mood === m.emoji ? m.color : '#f5f5f5',
                      color: mood === m.emoji ? '#ffffff' : '#333',
                      border: '2px solid',
                      borderColor: mood === m.emoji ? m.color : '#e0e0e0',
                      borderRadius: '0.5vw',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3vw',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{m.emoji}</span>
                    <span style={{ fontSize: '0.75vw' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drama Role Recognition */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                Did you notice yourself in a Drama Triangle role today?
              </label>
              <p style={{ fontSize: '0.85vw', color: '#666', marginBottom: '0.8vw' }}>
                It's okay - awareness is the first step!
              </p>
              <div style={{ display: 'flex', gap: '0.8vw' }}>
                {DRAMA_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setDramaRole(role.id)}
                    style={{
                      flex: 1,
                      padding: '1vw',
                      backgroundColor: dramaRole === role.id ? '#FFF8F0' : '#f9f9f9',
                      border: '2px solid',
                      borderColor: dramaRole === role.id ? '#8B4513' : '#e0e0e0',
                      borderRadius: '0.5vw',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '1.3vw' }}>{role.emoji}</span>
                    <p style={{ fontSize: '0.85vw', fontWeight: 500, margin: '0.3vw 0', color: '#333' }}>
                      {role.label}
                    </p>
                    <p style={{ fontSize: '0.7vw', color: '#666', margin: 0 }}>
                      {role.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compassion Role */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                Did you practice a Compassion Triangle response?
              </label>
              <p style={{ fontSize: '0.85vw', color: '#666', marginBottom: '0.8vw' }}>
                Celebrate your growth moments!
              </p>
              <div style={{ display: 'flex', gap: '0.8vw' }}>
                {COMPASSION_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setCompassionRole(role.id)}
                    style={{
                      flex: 1,
                      padding: '1vw',
                      backgroundColor: compassionRole === role.id ? '#F0F7F4' : '#f9f9f9',
                      border: '2px solid',
                      borderColor: compassionRole === role.id ? '#3D5A4C' : '#e0e0e0',
                      borderRadius: '0.5vw',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '1.3vw' }}>{role.emoji}</span>
                    <p style={{ fontSize: '0.85vw', fontWeight: 500, margin: '0.3vw 0', color: '#333' }}>
                      {role.label}
                    </p>
                    <p style={{ fontSize: '0.7vw', color: '#666', margin: 0 }}>
                      {role.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Situation */}
            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                What happened? (Brief situation)
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Describe a key moment or interaction..."
                style={{
                  width: '100%',
                  padding: '1vw',
                  fontSize: '0.95vw',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.6
                }}
                rows={2}
              />
            </div>

            {/* Reflection with Prompt */}
            <div style={{ marginBottom: '1.5vw' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5vw' }}>
                <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333' }}>
                  Reflection
                </label>
                <button
                  onClick={shufflePrompt}
                  style={{
                    padding: '0.3vw 0.6vw',
                    fontSize: '0.75vw',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '0.3vw',
                    cursor: 'pointer'
                  }}
                >
                  🎲 New prompt
                </button>
              </div>
              <p style={{ fontSize: '0.85vw', color: '#4B0082', fontStyle: 'italic', marginBottom: '0.5vw' }}>
                💭 {currentPrompt}
              </p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your thoughts..."
                style={{
                  width: '100%',
                  padding: '1vw',
                  fontSize: '0.95vw',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.6
                }}
                rows={4}
              />
            </div>

            {/* Gratitude */}
            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                Three things I'm grateful for
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vw' }}>
                {[
                  { value: gratitude1, setter: setGratitude1 },
                  { value: gratitude2, setter: setGratitude2 },
                  { value: gratitude3, setter: setGratitude3 },
                ].map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
                    <span style={{ color: '#3D5A4C', fontSize: '1vw' }}>✦</span>
                    <input
                      type="text"
                      value={g.value}
                      onChange={(e) => g.setter(e.target.value)}
                      placeholder={`Gratitude ${i + 1}...`}
                      style={{
                        flex: 1,
                        padding: '0.7vw 1vw',
                        fontSize: '0.95vw',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0.4vw',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Taken */}
            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                What action did you take? (or plan to take)
              </label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="One small step..."
                style={{
                  width: '100%',
                  padding: '0.8vw 1vw',
                  fontSize: '0.95vw',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Wins */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ fontSize: '1vw', fontWeight: 500, color: '#333', display: 'block', marginBottom: '0.5vw' }}>
                🎉 Today's win (big or small!)
              </label>
              <input
                type="text"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="Celebrate something..."
                style={{
                  width: '100%',
                  padding: '0.8vw 1vw',
                  fontSize: '0.95vw',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={saveEntry}
              disabled={!mood}
              style={{
                width: '100%',
                padding: '1vw',
                fontSize: '1vw',
                fontWeight: 500,
                backgroundColor: mood ? '#3D5A4C' : '#ccc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: mood ? 'pointer' : 'not-allowed'
              }}
            >
              Save Entry
            </button>
          </div>
        )}

        {/* Today's Entry (if exists and not writing) */}
        {todayEntry && !isWriting && (
          <div style={{
            backgroundColor: '#F0F7F4',
            borderRadius: '1vw',
            padding: '2vw',
            marginBottom: '2vw',
            border: '2px solid #3D5A4C'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5vw' }}>
              <h2 style={{
                fontSize: '1.3vw',
                fontWeight: 500,
                color: '#3D5A4C',
                fontFamily: 'Georgia, serif',
                margin: 0
              }}>
                ✓ Today's Entry Complete
              </h2>
              <span style={{ fontSize: '1.5vw' }}>{todayEntry.mood}</span>
            </div>
            
            {todayEntry.situation && (
              <p style={{ fontSize: '0.95vw', color: '#333', marginBottom: '1vw' }}>
                <strong>Situation:</strong> {todayEntry.situation}
              </p>
            )}
            {todayEntry.reflection && (
              <p style={{ fontSize: '0.95vw', color: '#333', marginBottom: '1vw' }}>
                <strong>Reflection:</strong> {todayEntry.reflection}
              </p>
            )}
            {todayEntry.wins && (
              <p style={{ fontSize: '0.95vw', color: '#3D5A4C', fontWeight: 500 }}>
                🎉 Win: {todayEntry.wins}
              </p>
            )}
          </div>
        )}

        {/* Past Entries */}
        <h2 style={{
          fontSize: '1.3vw',
          fontWeight: 500,
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          marginBottom: '1.5vw'
        }}>
          Past Entries
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
          {entries.filter(e => new Date(e.date).toDateString() !== new Date().toDateString()).map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.8vw',
                padding: '1.5vw',
                border: '1px solid #e8e8e8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
                  <span style={{ fontSize: '1.5vw' }}>{entry.mood}</span>
                  <div>
                    <p style={{ fontSize: '1vw', fontWeight: 500, color: '#333', margin: 0 }}>
                      {formatDate(new Date(entry.date))}
                    </p>
                    <p style={{ fontSize: '0.85vw', color: '#666', margin: 0, marginTop: '0.2vw' }}>
                      {entry.situation ? entry.situation.substring(0, 60) + (entry.situation.length > 60 ? '...' : '') : 'No situation recorded'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5vw' }}>
                  {entry.dramaRole && entry.dramaRole !== 'none' && (
                    <span style={{
                      padding: '0.3vw 0.6vw',
                      backgroundColor: '#FFF8F0',
                      color: '#8B4513',
                      borderRadius: '0.3vw',
                      fontSize: '0.75vw'
                    }}>
                      {DRAMA_ROLES.find(r => r.id === entry.dramaRole)?.label}
                    </span>
                  )}
                  {entry.compassionRole && entry.compassionRole !== 'none' && (
                    <span style={{
                      padding: '0.3vw 0.6vw',
                      backgroundColor: '#F0F7F4',
                      color: '#3D5A4C',
                      borderRadius: '0.3vw',
                      fontSize: '0.75vw'
                    }}>
                      {COMPASSION_ROLES.find(r => r.id === entry.compassionRole)?.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded View */}
              {selectedEntry?.id === entry.id && (
                <div style={{
                  marginTop: '1.5vw',
                  paddingTop: '1.5vw',
                  borderTop: '1px solid #e8e8e8'
                }}>
                  {entry.reflection && (
                    <div style={{ marginBottom: '1vw' }}>
                      <p style={{ fontSize: '0.85vw', color: '#666', margin: 0 }}>Reflection</p>
                      <p style={{ fontSize: '0.95vw', color: '#333', margin: '0.3vw 0 0 0' }}>{entry.reflection}</p>
                    </div>
                  )}
                  {entry.gratitude.length > 0 && (
                    <div style={{ marginBottom: '1vw' }}>
                      <p style={{ fontSize: '0.85vw', color: '#666', margin: 0 }}>Gratitude</p>
                      <div style={{ display: 'flex', gap: '0.5vw', flexWrap: 'wrap', marginTop: '0.3vw' }}>
                        {entry.gratitude.map((g, i) => (
                          <span key={i} style={{
                            padding: '0.3vw 0.8vw',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '1vw',
                            fontSize: '0.85vw',
                            color: '#333'
                          }}>
                            ✦ {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.actionTaken && (
                    <div style={{ marginBottom: '1vw' }}>
                      <p style={{ fontSize: '0.85vw', color: '#666', margin: 0 }}>Action Taken</p>
                      <p style={{ fontSize: '0.95vw', color: '#333', margin: '0.3vw 0 0 0' }}>{entry.actionTaken}</p>
                    </div>
                  )}
                  {entry.wins && (
                    <div style={{
                      padding: '0.8vw 1vw',
                      backgroundColor: '#F0F7F4',
                      borderRadius: '0.5vw'
                    }}>
                      <p style={{ fontSize: '0.95vw', color: '#3D5A4C', margin: 0 }}>
                        🎉 {entry.wins}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Insights */}
      <div style={{
        width: '18vw',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e8e8e8',
        padding: '2vw',
        overflowY: 'auto'
      }}>
        <h2 style={{
          fontSize: '1.1vw',
          fontWeight: 500,
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          marginBottom: '1.5vw'
        }}>
          Insights
        </h2>

        {/* Mood Trend */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#f9f9f9',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.8vw' }}>
            Mood This Week
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '4vw' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const dayMood = Math.random() * 4 + 1 // Simulated
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '1.2vw',
                    height: `${dayMood * 0.7}vw`,
                    backgroundColor: dayMood > 3 ? '#3D5A4C' : dayMood > 2 ? '#B8A038' : '#C97B4B',
                    borderRadius: '0.2vw',
                    marginBottom: '0.3vw'
                  }} />
                  <span style={{ fontSize: '0.7vw', color: '#666' }}>{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pattern Recognition */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#FFF8F0',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#8B4513', margin: 0, marginBottom: '0.5vw' }}>
            🔺 Drama Patterns
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
            Most common role: <strong>Rescuer</strong>
          </p>
          <p style={{ fontSize: '0.75vw', color: '#999', margin: '0.3vw 0 0 0' }}>
            Noticed in 4 of last 7 entries
          </p>
        </div>

        {/* Growth */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#3D5A4C', margin: 0, marginBottom: '0.5vw' }}>
            💚 Growth Moments
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
            Practiced <strong>Caring</strong> 3 times this week
          </p>
          <p style={{ fontSize: '0.75vw', color: '#999', margin: '0.3vw 0 0 0' }}>
            Keep it up!
          </p>
        </div>

        {/* Quick Links */}
        <h3 style={{
          fontSize: '0.95vw',
          fontWeight: 500,
          color: '#1a1a1a',
          marginBottom: '1vw'
        }}>
          Reflect Deeper
        </h3>

        <Link
          href="/coach"
          style={{
            display: 'block',
            padding: '1vw',
            backgroundColor: '#3D5A4C',
            color: '#ffffff',
            borderRadius: '0.5vw',
            textDecoration: 'none',
            fontSize: '0.9vw',
            textAlign: 'center',
            marginBottom: '0.8vw'
          }}
        >
          🎯 Talk to Compassion Coach
        </Link>

        <Link
          href="/mentor"
          style={{
            display: 'block',
            padding: '1vw',
            backgroundColor: '#4B0082',
            color: '#ffffff',
            borderRadius: '0.5vw',
            textDecoration: 'none',
            fontSize: '0.9vw',
            textAlign: 'center'
          }}
        >
          📚 Ask the Mentor
        </Link>

        {/* Prompts */}
        <div style={{ marginTop: '1.5vw' }}>
          <h3 style={{
            fontSize: '0.95vw',
            fontWeight: 500,
            color: '#1a1a1a',
            marginBottom: '1vw'
          }}>
            Reflection Prompts
          </h3>
          
          {PROMPTS.slice(0, 3).map((prompt, i) => (
            <div
              key={i}
              style={{
                padding: '0.8vw 1vw',
                backgroundColor: '#f9f9f9',
                borderRadius: '0.5vw',
                marginBottom: '0.5vw',
                fontSize: '0.8vw',
                color: '#666',
                fontStyle: 'italic'
              }}
            >
              "{prompt}"
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}