'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Action {
  id: string
  action: string
  timeline: string
  accountability: string
  completed: boolean
  created_at: string
  session_topic: string
  completed_at?: string
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    fetchActions()
  }, [])

  const fetchActions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('actions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setActions(data || [])
      }
    } catch (error) {
      console.error('Error fetching actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActions = actions.filter(a => {
    if (filter === 'pending') return !a.completed
    if (filter === 'completed') return a.completed
    return true
  })

  const pendingCount = actions.filter(a => !a.completed).length
  const completedCount = actions.filter(a => a.completed).length
  const completionRate = actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('actions')
        .update({ 
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error
      
      setActions(prev => prev.map(a => 
        a.id === id 
          ? { ...a, completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : undefined }
          : a
      ))
    } catch (error) {
      console.error('Error updating action:', error)
    }
  }

  const deleteAction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setActions(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Error deleting action:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex' }}>
      
      {/* Sidebar */}
      <div style={{ width: '16vw', minHeight: '100vh', backgroundColor: '#3D5A4C', padding: '2.5vw 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.3vw', fontWeight: 400, color: '#ffffff', fontFamily: 'Georgia, serif' }}>Drama Triangle</h1>
            <p style={{ fontSize: '1vw', fontWeight: 300, color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif', marginTop: '0.2vw' }}>Coach</p>
          </Link>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 2vw 2vw 2vw' }} />

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Compassion Coach', href: '/coach' },
            { name: 'Mentor Coach', href: '/mentor' },
            { name: 'Learn', href: '/learn' },
            { name: 'Practice', href: '/practice' },
            { name: 'Journal', href: '/journal' },
            { name: 'Progress', href: '/progress' },
            { name: 'Actions', href: '/actions', active: true },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ display: 'block', padding: '1vw 1.5vw', marginBottom: '0.3vw', borderRadius: '0.4vw', backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent', color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '1vw', fontWeight: item.active ? 500 : 400 }}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '0 2vw' }}>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '2vw' }} />
          <div style={{ padding: '1vw', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8vw' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Pending</p>
                <p style={{ color: '#ffffff', fontSize: '1.3vw', fontWeight: 600, margin: 0 }}>{pendingCount}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Done</p>
                <p style={{ color: '#ffffff', fontSize: '1.3vw', fontWeight: 600, margin: 0 }}>{completedCount}</p>
              </div>
            </div>
            <div style={{ height: '0.4vw', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.2vw', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionRate}%`, backgroundColor: '#ffffff', borderRadius: '0.2vw' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75vw', margin: '0.5vw 0 0 0' }}>{completionRate}% completion rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2.5vw', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2vw', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2vw', fontWeight: 500, color: '#1a1a1a', fontFamily: 'Georgia, serif', margin: 0 }}>Committed Actions</h1>
            <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>Actions from your coaching sessions</p>
          </div>
          <Link href="/coach" style={{ padding: '0.8vw 1.5vw', fontSize: '0.95vw', backgroundColor: '#3D5A4C', color: '#ffffff', border: 'none', borderRadius: '0.5vw', textDecoration: 'none', fontWeight: 500 }}>
            + New Coaching Session
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2vw', marginBottom: '2vw' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.8vw', padding: '1.2vw', border: '1px solid #e8e8e8', textAlign: 'center' }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#3D5A4C', margin: 0 }}>{actions.length}</p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>Total Actions</p>
          </div>
          <div style={{ backgroundColor: '#FFF8F0', borderRadius: '0.8vw', padding: '1.2vw', border: '1px solid #e8e8e8', textAlign: 'center' }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#8B4513', margin: 0 }}>{pendingCount}</p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>Pending</p>
          </div>
          <div style={{ backgroundColor: '#F0F7F4', borderRadius: '0.8vw', padding: '1.2vw', border: '1px solid #e8e8e8', textAlign: 'center' }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#3D5A4C', margin: 0 }}>{completedCount}</p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>Completed</p>
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.8vw', padding: '1.2vw', border: '1px solid #e8e8e8', textAlign: 'center' }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#4B0082', margin: 0 }}>{completionRate}%</p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>Success Rate</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5vw' }}>
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            {[
              { key: 'all', label: `All (${actions.length})` },
              { key: 'pending', label: `Pending (${pendingCount})` },
              { key: 'completed', label: `Completed (${completedCount})` },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key as typeof filter)} style={{ padding: '0.5vw 1vw', fontSize: '0.85vw', backgroundColor: filter === f.key ? '#3D5A4C' : '#ffffff', color: filter === f.key ? '#ffffff' : '#666', border: '1px solid', borderColor: filter === f.key ? '#3D5A4C' : '#e0e0e0', borderRadius: '0.4vw', cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions List */}
        <div>
          {loading ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1vw', padding: '3vw', textAlign: 'center', border: '1px solid #e8e8e8' }}>
              <p style={{ fontSize: '1.1vw', color: '#666' }}>Loading actions...</p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1vw', padding: '3vw', textAlign: 'center', border: '1px solid #e8e8e8' }}>
              <p style={{ fontSize: '2vw', margin: 0, marginBottom: '1vw' }}>
                {filter === 'pending' ? '✅' : filter === 'completed' ? '📝' : '🎯'}
              </p>
              <p style={{ fontSize: '1.1vw', color: '#333', margin: 0, marginBottom: '0.5vw' }}>
                {filter === 'pending' ? 'No pending actions!' : filter === 'completed' ? 'No completed actions yet' : 'No actions yet'}
              </p>
              <p style={{ fontSize: '0.9vw', color: '#666', margin: 0 }}>
                {filter === 'pending' ? 'Great job staying on top of your commitments!' : 'Start a coaching session to create action items'}
              </p>
              {actions.length === 0 && (
                <Link href="/coach" style={{ display: 'inline-block', marginTop: '1.5vw', padding: '0.8vw 1.5vw', backgroundColor: '#3D5A4C', color: '#fff', borderRadius: '0.5vw', textDecoration: 'none', fontSize: '0.95vw' }}>
                  Start Coaching Session
                </Link>
              )}
            </div>
          ) : (
            filteredActions.map((action) => (
              <div key={action.id} style={{ backgroundColor: action.completed ? '#F0F7F4' : '#ffffff', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1vw', border: '1px solid', borderColor: action.completed ? '#3D5A4C' : '#e8e8e8' }}>
                <div style={{ display: 'flex', gap: '1vw' }}>
                  <button onClick={() => toggleComplete(action.id, action.completed)} style={{ width: '1.8vw', height: '1.8vw', borderRadius: '50%', border: '2px solid', borderColor: action.completed ? '#3D5A4C' : '#ccc', backgroundColor: action.completed ? '#3D5A4C' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vw' }}>
                    {action.completed && <span style={{ color: '#fff', fontSize: '0.9vw' }}>✓</span>}
                  </button>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '1.05vw', color: action.completed ? '#666' : '#1a1a1a', textDecoration: action.completed ? 'line-through' : 'none', margin: 0, marginBottom: '0.8vw', lineHeight: 1.5 }}>
                      {action.action}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1vw', marginBottom: '0.8vw' }}>
                      {action.timeline && (
                        <span style={{ padding: '0.3vw 0.8vw', backgroundColor: action.completed ? '#e8e8e8' : '#FFF8F0', color: action.completed ? '#666' : '#8B4513', borderRadius: '0.3vw', fontSize: '0.8vw' }}>
                          📅 {action.timeline}
                        </span>
                      )}
                      {action.accountability && (
                        <span style={{ padding: '0.3vw 0.8vw', backgroundColor: '#f5f5f5', color: '#666', borderRadius: '0.3vw', fontSize: '0.8vw' }}>
                          ✓ {action.accountability}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.8vw', color: '#999', margin: 0 }}>
                        {action.session_topic && <>From: <span style={{ color: '#666' }}>{action.session_topic}</span> • </>}
                        {formatDate(action.created_at)}
                      </p>
                      
                      {action.completed && action.completed_at && (
                        <p style={{ fontSize: '0.8vw', color: '#3D5A4C', margin: 0 }}>
                          ✓ Completed {formatDate(action.completed_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button onClick={() => deleteAction(action.id)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '1vw', cursor: 'pointer', padding: '0.3vw', opacity: 0.5 }}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '18vw', minHeight: '100vh', backgroundColor: '#ffffff', borderLeft: '1px solid #e8e8e8', padding: '2vw', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.1vw', fontWeight: 500, color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '1.5vw' }}>Action Tips</h2>

        <div style={{ backgroundColor: '#F0F7F4', borderRadius: '0.8vw', padding: '1.5vw', marginBottom: '1.5vw', textAlign: 'center' }}>
          <div style={{ width: '6vw', height: '6vw', borderRadius: '50%', border: '0.4vw solid #e8e8e8', borderTopColor: '#3D5A4C', borderRightColor: completionRate > 25 ? '#3D5A4C' : '#e8e8e8', borderBottomColor: completionRate > 50 ? '#3D5A4C' : '#e8e8e8', borderLeftColor: completionRate > 75 ? '#3D5A4C' : '#e8e8e8', margin: '0 auto 1vw auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.3vw', fontWeight: 600, color: '#3D5A4C' }}>{completionRate}%</span>
          </div>
          <p style={{ fontSize: '0.9vw', color: '#333', margin: 0 }}>
            {completionRate >= 75 ? '🎉 Excellent follow-through!' : completionRate >= 50 ? '💪 Good progress!' : completionRate >= 25 ? '📈 Keep going!' : '🚀 You got this!'}
          </p>
        </div>

        <div style={{ backgroundColor: '#F5F5FF', borderRadius: '0.8vw', padding: '1.2vw', marginBottom: '1.5vw' }}>
          <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#4B0082', margin: 0, marginBottom: '0.5vw' }}>💡 Effective Actions Are:</p>
          <ul style={{ fontSize: '0.8vw', color: '#666', margin: 0, paddingLeft: '1.2vw', lineHeight: 1.8 }}>
            <li><strong>Specific</strong> - Clear and defined</li>
            <li><strong>Measurable</strong> - You'll know when done</li>
            <li><strong>Achievable</strong> - Within your control</li>
            <li><strong>Relevant</strong> - Connected to growth</li>
            <li><strong>Time-bound</strong> - Has a deadline</li>
          </ul>
        </div>

        <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#1a1a1a', marginBottom: '1vw' }}>Get Support</h3>

        <Link href="/coach" style={{ display: 'block', padding: '1vw', backgroundColor: '#3D5A4C', color: '#ffffff', borderRadius: '0.5vw', textDecoration: 'none', fontSize: '0.9vw', textAlign: 'center', marginBottom: '0.8vw' }}>
          🎯 Coaching Session
        </Link>

        <Link href="/journal" style={{ display: 'block', padding: '1vw', backgroundColor: '#f5f5f5', color: '#333', borderRadius: '0.5vw', textDecoration: 'none', fontSize: '0.9vw', textAlign: 'center' }}>
          📝 Reflect in Journal
        </Link>

        <div style={{ marginTop: '1.5vw', padding: '1.2vw', backgroundColor: '#FFF8F0', borderRadius: '0.8vw' }}>
          <p style={{ fontSize: '0.9vw', color: '#8B4513', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
            "Small actions, consistently taken, create lasting change."
          </p>
          <p style={{ fontSize: '0.75vw', color: '#999', margin: '0.5vw 0 0 0', textAlign: 'right' }}>— Dr. Stephen Karpman</p>
        </div>
      </div>
    </div>
  )
}
