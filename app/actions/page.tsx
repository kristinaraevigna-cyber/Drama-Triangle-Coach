'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Action {
  id: number
  action: string
  timeline: string
  accountability: string
  completed: boolean
  createdAt: Date
  sessionTopic: string
  completedAt?: Date
}

const SAMPLE_ACTIONS: Action[] = [
  {
    id: 1,
    action: 'Have a direct conversation with my colleague about workload distribution',
    timeline: 'By Friday',
    accountability: 'Tell my partner I did it',
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 5),
    sessionTopic: 'Setting boundaries at work',
    completedAt: new Date(Date.now() - 86400000 * 3)
  },
  {
    id: 2,
    action: 'Practice saying "Let me think about that" before automatically saying yes',
    timeline: 'This week',
    accountability: 'Track in journal',
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 4),
    sessionTopic: 'Rescuer pattern awareness',
    completedAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 3,
    action: 'Write down my needs before the family dinner',
    timeline: 'Before Sunday',
    accountability: 'Review with coach',
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 3),
    sessionTopic: 'Family dynamics',
    completedAt: new Date(Date.now() - 86400000 * 1)
  },
  {
    id: 4,
    action: 'Use "I feel... when... I need..." format when discussing the project delay',
    timeline: 'Monday meeting',
    accountability: 'Self-reflection after',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
    sessionTopic: 'Assertive communication'
  },
  {
    id: 5,
    action: 'Ask "How can I support you?" instead of jumping in to fix',
    timeline: 'Next time partner vents',
    accountability: 'Notice and journal',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1),
    sessionTopic: 'From Rescuer to Caring'
  },
  {
    id: 6,
    action: 'Take 3 deep breaths before responding when feeling triggered',
    timeline: 'Ongoing',
    accountability: 'Daily check-in',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1),
    sessionTopic: 'Managing reactivity'
  },
  {
    id: 7,
    action: 'Share one vulnerable feeling with a trusted friend',
    timeline: 'This weekend',
    accountability: 'Journal about it',
    completed: false,
    createdAt: new Date(),
    sessionTopic: 'Practicing vulnerability'
  },
]

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>(SAMPLE_ACTIONS)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'timeline'>('date')

  const filteredActions = actions
    .filter(a => {
      if (filter === 'pending') return !a.completed
      if (filter === 'completed') return a.completed
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

  const pendingCount = actions.filter(a => !a.completed).length
  const completedCount = actions.filter(a => a.completed).length
  const completionRate = actions.length > 0 
    ? Math.round((completedCount / actions.length) * 100) 
    : 0

  const toggleComplete = (id: number) => {
    setActions(prev => prev.map(a => 
      a.id === id 
        ? { ...a, completed: !a.completed, completedAt: !a.completed ? new Date() : undefined }
        : a
    ))
  }

  const deleteAction = (id: number) => {
    setActions(prev => prev.filter(a => a.id !== id))
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
            { name: 'Journal', href: '/journal', active: false },
            { name: 'Progress', href: '/progress', active: false },
            { name: 'Actions', href: '/actions', active: true },
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
          
          {/* Action Stats */}
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8vw' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Pending</p>
                <p style={{ color: '#ffffff', fontSize: '1.3vw', fontWeight: 600, margin: 0 }}>
                  {pendingCount}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7vw', margin: 0 }}>Done</p>
                <p style={{ color: '#ffffff', fontSize: '1.3vw', fontWeight: 600, margin: 0 }}>
                  {completedCount}
                </p>
              </div>
            </div>
            <div style={{
              height: '0.4vw',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '0.2vw',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completionRate}%`,
                backgroundColor: '#ffffff',
                borderRadius: '0.2vw'
              }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75vw', margin: '0.5vw 0 0 0' }}>
              {completionRate}% completion rate
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
              Committed Actions
            </h1>
            <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
              Actions from your coaching sessions
            </p>
          </div>

          <Link
            href="/coach"
            style={{
              padding: '0.8vw 1.5vw',
              fontSize: '0.95vw',
              backgroundColor: '#3D5A4C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5vw',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            + New Coaching Session
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.2vw',
          marginBottom: '2vw'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.8vw',
            padding: '1.2vw',
            border: '1px solid #e8e8e8',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#3D5A4C', margin: 0 }}>
              {actions.length}
            </p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>
              Total Actions
            </p>
          </div>
          <div style={{
            backgroundColor: '#FFF8F0',
            borderRadius: '0.8vw',
            padding: '1.2vw',
            border: '1px solid #e8e8e8',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#8B4513', margin: 0 }}>
              {pendingCount}
            </p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>
              Pending
            </p>
          </div>
          <div style={{
            backgroundColor: '#F0F7F4',
            borderRadius: '0.8vw',
            padding: '1.2vw',
            border: '1px solid #e8e8e8',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#3D5A4C', margin: 0 }}>
              {completedCount}
            </p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>
              Completed
            </p>
          </div>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.8vw',
            padding: '1.2vw',
            border: '1px solid #e8e8e8',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.8vw', fontWeight: 600, color: '#4B0082', margin: 0 }}>
              {completionRate}%
            </p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>
              Success Rate
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5vw'
        }}>
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            {[
              { key: 'all', label: `All (${actions.length})` },
              { key: 'pending', label: `Pending (${pendingCount})` },
              { key: 'completed', label: `Completed (${completedCount})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                style={{
                  padding: '0.5vw 1vw',
                  fontSize: '0.85vw',
                  backgroundColor: filter === f.key ? '#3D5A4C' : '#ffffff',
                  color: filter === f.key ? '#ffffff' : '#666',
                  border: '1px solid',
                  borderColor: filter === f.key ? '#3D5A4C' : '#e0e0e0',
                  borderRadius: '0.4vw',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            style={{
              padding: '0.5vw 1vw',
              fontSize: '0.85vw',
              border: '1px solid #e0e0e0',
              borderRadius: '0.4vw',
              backgroundColor: '#ffffff',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="timeline">Sort by Timeline</option>
          </select>
        </div>

        {/* Actions List */}
        <div>
          {filteredActions.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1vw',
              padding: '3vw',
              textAlign: 'center',
              border: '1px solid #e8e8e8'
            }}>
              <p style={{ fontSize: '2vw', margin: 0, marginBottom: '1vw' }}>✅</p>
              <p style={{ fontSize: '1.1vw', color: '#333', margin: 0, marginBottom: '0.5vw' }}>
                {filter === 'pending' ? 'No pending actions!' : 
                 filter === 'completed' ? 'No completed actions yet' : 'No actions yet'}
              </p>
              <p style={{ fontSize: '0.9vw', color: '#666', margin: 0 }}>
                {filter === 'pending' ? 'Great job staying on top of your commitments!' :
                 'Start a coaching session to create action items'}
              </p>
            </div>
          ) : (
            filteredActions.map((action) => (
              <div
                key={action.id}
                style={{
                  backgroundColor: action.completed ? '#F0F7F4' : '#ffffff',
                  borderRadius: '0.8vw',
                  padding: '1.5vw',
                  marginBottom: '1vw',
                  border: '1px solid',
                  borderColor: action.completed ? '#3D5A4C' : '#e8e8e8',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '1vw' }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(action.id)}
                    style={{
                      width: '1.8vw',
                      height: '1.8vw',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: action.completed ? '#3D5A4C' : '#ccc',
                      backgroundColor: action.completed ? '#3D5A4C' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.2vw'
                    }}
                  >
                    {action.completed && (
                      <span style={{ color: '#fff', fontSize: '0.9vw' }}>✓</span>
                    )}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '1.05vw',
                      color: action.completed ? '#666' : '#1a1a1a',
                      textDecoration: action.completed ? 'line-through' : 'none',
                      margin: 0,
                      marginBottom: '0.8vw',
                      lineHeight: 1.5
                    }}>
                      {action.action}
                    </p>

                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1vw',
                      marginBottom: '0.8vw'
                    }}>
                      <span style={{
                        padding: '0.3vw 0.8vw',
                        backgroundColor: action.completed ? '#e8e8e8' : '#FFF8F0',
                        color: action.completed ? '#666' : '#8B4513',
                        borderRadius: '0.3vw',
                        fontSize: '0.8vw'
                      }}>
                        📅 {action.timeline}
                      </span>
                      <span style={{
                        padding: '0.3vw 0.8vw',
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        borderRadius: '0.3vw',
                        fontSize: '0.8vw'
                      }}>
                        ✓ {action.accountability}
                      </span>
                    </div>

                    {/* Session info */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <p style={{ fontSize: '0.8vw', color: '#999', margin: 0 }}>
                        From: <span style={{ color: '#666' }}>{action.sessionTopic}</span>
                        {' • '}{formatDate(new Date(action.createdAt))}
                      </p>
                      
                      {action.completed && action.completedAt && (
                        <p style={{ fontSize: '0.8vw', color: '#3D5A4C', margin: 0 }}>
                          ✓ Completed {formatDate(action.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteAction(action.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ccc',
                      fontSize: '1vw',
                      cursor: 'pointer',
                      padding: '0.3vw',
                      opacity: 0.5,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.5'}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Tips & Quick Actions */}
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
          Action Tips
        </h2>

        {/* Progress Ring */}
        <div style={{
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw',
          padding: '1.5vw',
          marginBottom: '1.5vw',
          textAlign: 'center'
        }}>
          <div style={{
            width: '6vw',
            height: '6vw',
            borderRadius: '50%',
            border: '0.4vw solid #e8e8e8',
            borderTopColor: '#3D5A4C',
            borderRightColor: completionRate > 25 ? '#3D5A4C' : '#e8e8e8',
            borderBottomColor: completionRate > 50 ? '#3D5A4C' : '#e8e8e8',
            borderLeftColor: completionRate > 75 ? '#3D5A4C' : '#e8e8e8',
            margin: '0 auto 1vw auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.3vw', fontWeight: 600, color: '#3D5A4C' }}>
              {completionRate}%
            </span>
          </div>
          <p style={{ fontSize: '0.9vw', color: '#333', margin: 0 }}>
            {completionRate >= 75 ? '🎉 Excellent follow-through!' :
             completionRate >= 50 ? '💪 Good progress!' :
             completionRate >= 25 ? '📈 Keep going!' :
             '🚀 You got this!'}
          </p>
        </div>

        {/* SMART Goals tip */}
        <div style={{
          backgroundColor: '#F5F5FF',
          borderRadius: '0.8vw',
          padding: '1.2vw',
          marginBottom: '1.5vw'
        }}>
          <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#4B0082', margin: 0, marginBottom: '0.5vw' }}>
            💡 Effective Actions Are:
          </p>
          <ul style={{ 
            fontSize: '0.8vw', 
            color: '#666', 
            margin: 0, 
            paddingLeft: '1.2vw',
            lineHeight: 1.8
          }}>
            <li><strong>Specific</strong> - Clear and defined</li>
            <li><strong>Measurable</strong> - You'll know when it's done</li>
            <li><strong>Achievable</strong> - Within your control</li>
            <li><strong>Relevant</strong> - Connected to your growth</li>
            <li><strong>Time-bound</strong> - Has a deadline</li>
          </ul>
        </div>

        {/* Quick Links */}
        <h3 style={{
          fontSize: '0.95vw',
          fontWeight: 500,
          color: '#1a1a1a',
          marginBottom: '1vw'
        }}>
          Get Support
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
          🎯 Coaching Session
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
            textAlign: 'center',
            marginBottom: '0.8vw'
          }}
        >
          📚 Ask the Mentor
        </Link>

        <Link
          href="/journal"
          style={{
            display: 'block',
            padding: '1vw',
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: '0.5vw',
            textDecoration: 'none',
            fontSize: '0.9vw',
            textAlign: 'center'
          }}
        >
          📝 Reflect in Journal
        </Link>

        {/* Motivation */}
        <div style={{
          marginTop: '1.5vw',
          padding: '1.2vw',
          backgroundColor: '#FFF8F0',
          borderRadius: '0.8vw'
        }}>
          <p style={{ 
            fontSize: '0.9vw', 
            color: '#8B4513', 
            margin: 0,
            fontStyle: 'italic',
            lineHeight: 1.6
          }}>
            "Small actions, consistently taken, create lasting change."
          </p>
          <p style={{ 
            fontSize: '0.75vw', 
            color: '#999', 
            margin: '0.5vw 0 0 0',
            textAlign: 'right'
          }}>
            — Dr. Stephen Karpman
          </p>
        </div>
      </div>
    </div>
  )
}