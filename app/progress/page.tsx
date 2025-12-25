'use client'

import Link from 'next/link'
import { useState } from 'react'

interface WeekData {
  day: string
  mood: number
  sessions: number
  practice: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  progress?: number
  total?: number
}

const WEEK_DATA: WeekData[] = [
  { day: 'Mon', mood: 4, sessions: 2, practice: 3 },
  { day: 'Tue', mood: 3, sessions: 1, practice: 2 },
  { day: 'Wed', mood: 4, sessions: 1, practice: 4 },
  { day: 'Thu', mood: 5, sessions: 2, practice: 2 },
  { day: 'Fri', mood: 4, sessions: 0, practice: 1 },
  { day: 'Sat', mood: 3, sessions: 1, practice: 3 },
  { day: 'Sun', mood: 4, sessions: 1, practice: 2 },
]

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first coaching session', icon: '🎯', earned: true, earnedDate: 'Dec 20' },
  { id: '2', title: 'Self-Aware', description: 'Identify a Drama Triangle role in yourself', icon: '🔍', earned: true, earnedDate: 'Dec 21' },
  { id: '3', title: 'Pattern Breaker', description: 'Shift from Drama to Compassion 5 times', icon: '🔄', earned: true, earnedDate: 'Dec 23' },
  { id: '4', title: 'Journal Keeper', description: 'Write 7 journal entries', icon: '📝', earned: true, earnedDate: 'Dec 24' },
  { id: '5', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', earned: true, earnedDate: 'Dec 25' },
  { id: '6', title: 'Scholar', description: 'Complete all Drama Triangle lessons', icon: '📚', earned: true, earnedDate: 'Dec 22' },
  { id: '7', title: 'Compassion Master', description: 'Complete all Compassion Triangle lessons', icon: '💚', earned: false, progress: 3, total: 4 },
  { id: '8', title: 'Practice Pro', description: 'Complete 20 practice scenarios', icon: '🎮', earned: false, progress: 12, total: 20 },
  { id: '9', title: 'Action Taker', description: 'Complete 10 committed actions', icon: '✅', earned: false, progress: 6, total: 10 },
  { id: '10', title: 'Voice Explorer', description: 'Use voice chat 5 times', icon: '🎙️', earned: false, progress: 3, total: 5 },
  { id: '11', title: 'Mentor Student', description: 'Have 10 mentor sessions', icon: '🎓', earned: false, progress: 5, total: 10 },
  { id: '12', title: 'Month Master', description: 'Maintain a 30-day streak', icon: '🏆', earned: false, progress: 7, total: 30 },
]

const ROLE_STATS = [
  { role: 'Victim', identified: 8, shifted: 6, color: '#C97B4B' },
  { role: 'Persecutor', identified: 4, shifted: 3, color: '#A85454' },
  { role: 'Rescuer', identified: 12, shifted: 9, color: '#6B8E6B' },
]

const COMPASSION_STATS = [
  { role: 'Vulnerable', practiced: 6, color: '#3D5A4C' },
  { role: 'Assertive', practiced: 4, color: '#4B7B4B' },
  { role: 'Caring', practiced: 8, color: '#6B9E6B' },
]

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  const totalSessions = 15
  const totalJournalEntries = 12
  const totalPracticeScenarios = 24
  const currentStreak = 7
  const longestStreak = 7
  const actionsCompleted = 6
  const totalActions = 10

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
            { name: 'Progress', href: '/progress', active: true },
            { name: 'Actions', href: '/actions', active: false },
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
          
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw',
            textAlign: 'center'
          }}>
            <p style={{ color: '#ffffff', fontSize: '2vw', margin: 0 }}>🔥</p>
            <p style={{ color: '#ffffff', fontSize: '1.5vw', fontWeight: 600, margin: '0.3vw 0' }}>
              {currentStreak}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8vw', margin: 0 }}>
              Day Streak
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
              Your Progress
            </h1>
            <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
              Track your growth and celebrate wins
            </p>
          </div>

          {/* Time Range Filter */}
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            {[
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'all', label: 'All Time' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as typeof timeRange)}
                style={{
                  padding: '0.5vw 1vw',
                  fontSize: '0.85vw',
                  backgroundColor: timeRange === t.key ? '#3D5A4C' : '#ffffff',
                  color: timeRange === t.key ? '#ffffff' : '#666',
                  border: '1px solid',
                  borderColor: timeRange === t.key ? '#3D5A4C' : '#e0e0e0',
                  borderRadius: '0.4vw',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1.2vw',
          marginBottom: '2vw'
        }}>
          {[
            { label: 'Day Streak', value: currentStreak, icon: '🔥', color: '#FF6B35' },
            { label: 'Coaching Sessions', value: totalSessions, icon: '🎯', color: '#3D5A4C' },
            { label: 'Journal Entries', value: totalJournalEntries, icon: '📝', color: '#4B0082' },
            { label: 'Practice Scenarios', value: totalPracticeScenarios, icon: '🎮', color: '#8B4513' },
            { label: 'Actions Completed', value: `${actionsCompleted}/${totalActions}`, icon: '✅', color: '#2E8B57' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.8vw',
              padding: '1.2vw',
              border: '1px solid #e8e8e8',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.5vw', margin: 0, marginBottom: '0.3vw' }}>{stat.icon}</p>
              <p style={{
                fontSize: '1.5vw',
                fontWeight: 600,
                color: stat.color,
                margin: 0
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.8vw', color: '#666', margin: 0, marginTop: '0.3vw' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5vw',
          marginBottom: '2vw'
        }}>
          {/* Weekly Activity Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '1.5vw',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{
              fontSize: '1.1vw',
              fontWeight: 500,
              color: '#1a1a1a',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Weekly Activity
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '10vw' }}>
              {WEEK_DATA.map((day, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2vw',
                    marginBottom: '0.5vw'
                  }}>
                    {/* Mood bar */}
                    <div style={{
                      width: '1.5vw',
                      height: `${day.mood * 1.5}vw`,
                      backgroundColor: '#3D5A4C',
                      borderRadius: '0.2vw',
                      opacity: 0.8
                    }} />
                    {/* Sessions bar */}
                    <div style={{
                      width: '1.5vw',
                      height: `${day.sessions * 1.5}vw`,
                      backgroundColor: '#4B0082',
                      borderRadius: '0.2vw',
                      opacity: 0.8
                    }} />
                    {/* Practice bar */}
                    <div style={{
                      width: '1.5vw',
                      height: `${day.practice * 0.8}vw`,
                      backgroundColor: '#8B4513',
                      borderRadius: '0.2vw',
                      opacity: 0.8
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8vw', color: '#666' }}>{day.day}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5vw', marginTop: '1vw', justifyContent: 'center' }}>
              {[
                { label: 'Mood', color: '#3D5A4C' },
                { label: 'Sessions', color: '#4B0082' },
                { label: 'Practice', color: '#8B4513' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3vw' }}>
                  <div style={{
                    width: '0.8vw',
                    height: '0.8vw',
                    backgroundColor: item.color,
                    borderRadius: '0.2vw'
                  }} />
                  <span style={{ fontSize: '0.75vw', color: '#666' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Card */}
          <div style={{
            backgroundColor: '#FFF8F0',
            borderRadius: '1vw',
            padding: '1.5vw',
            border: '1px solid #e8e8e8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p style={{ fontSize: '3vw', margin: 0 }}>🔥</p>
            <p style={{
              fontSize: '2.5vw',
              fontWeight: 700,
              color: '#FF6B35',
              margin: '0.5vw 0'
            }}>
              {currentStreak}
            </p>
            <p style={{ fontSize: '1vw', color: '#666', margin: 0 }}>Day Streak</p>
            <p style={{ fontSize: '0.85vw', color: '#999', margin: '0.5vw 0 0 0' }}>
              Longest: {longestStreak} days
            </p>
            
            {/* Week dots */}
            <div style={{ display: 'flex', gap: '0.5vw', marginTop: '1vw' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} style={{
                  width: '1.5vw',
                  height: '1.5vw',
                  borderRadius: '50%',
                  backgroundColor: i < currentStreak ? '#FF6B35' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '0.6vw', color: i < currentStreak ? '#fff' : '#999' }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drama Triangle Insights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5vw',
          marginBottom: '2vw'
        }}>
          {/* Drama Roles Identified */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '1.5vw',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{
              fontSize: '1.1vw',
              fontWeight: 500,
              color: '#1a1a1a',
              margin: 0,
              marginBottom: '1vw'
            }}>
              🔺 Drama Roles Identified & Shifted
            </h3>
            
            {ROLE_STATS.map((stat, i) => (
              <div key={i} style={{ marginBottom: i < ROLE_STATS.length - 1 ? '1vw' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3vw' }}>
                  <span style={{ fontSize: '0.9vw', color: '#333' }}>{stat.role}</span>
                  <span style={{ fontSize: '0.85vw', color: '#666' }}>
                    {stat.shifted}/{stat.identified} shifted
                  </span>
                </div>
                <div style={{
                  height: '0.6vw',
                  backgroundColor: '#e8e8e8',
                  borderRadius: '0.3vw',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(stat.identified / 15) * 100}%`,
                    backgroundColor: stat.color,
                    borderRadius: '0.3vw',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${((stat.identified - stat.shifted) / stat.identified) * 100}%`,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                      borderRadius: '0 0.3vw 0.3vw 0'
                    }} />
                  </div>
                </div>
              </div>
            ))}

            <p style={{ fontSize: '0.8vw', color: '#666', margin: '1vw 0 0 0', fontStyle: 'italic' }}>
              Your most common entry point: <strong>Rescuer</strong>
            </p>
          </div>

          {/* Compassion Roles Practiced */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '1.5vw',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{
              fontSize: '1.1vw',
              fontWeight: 500,
              color: '#1a1a1a',
              margin: 0,
              marginBottom: '1vw'
            }}>
              💚 Compassion Roles Practiced
            </h3>
            
            {COMPASSION_STATS.map((stat, i) => (
              <div key={i} style={{ marginBottom: i < COMPASSION_STATS.length - 1 ? '1vw' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3vw' }}>
                  <span style={{ fontSize: '0.9vw', color: '#333' }}>{stat.role}</span>
                  <span style={{ fontSize: '0.85vw', color: '#666' }}>
                    {stat.practiced} times
                  </span>
                </div>
                <div style={{
                  height: '0.6vw',
                  backgroundColor: '#e8e8e8',
                  borderRadius: '0.3vw',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(stat.practiced / 10) * 100}%`,
                    backgroundColor: stat.color,
                    borderRadius: '0.3vw'
                  }} />
                </div>
              </div>
            ))}

            <p style={{ fontSize: '0.8vw', color: '#666', margin: '1vw 0 0 0', fontStyle: 'italic' }}>
              Your strongest: <strong>Caring</strong> 🤗
            </p>
          </div>
        </div>

        {/* Achievements */}
        <h2 style={{
          fontSize: '1.3vw',
          fontWeight: 500,
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          marginBottom: '1.5vw'
        }}>
          🏆 Achievements
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1vw'
        }}>
          {ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.id}
              style={{
                backgroundColor: achievement.earned ? '#ffffff' : '#f9f9f9',
                borderRadius: '0.8vw',
                padding: '1.2vw',
                border: '1px solid',
                borderColor: achievement.earned ? '#3D5A4C' : '#e8e8e8',
                opacity: achievement.earned ? 1 : 0.7,
                position: 'relative'
              }}
            >
              {achievement.earned && (
                <div style={{
                  position: 'absolute',
                  top: '0.5vw',
                  right: '0.5vw',
                  width: '1.2vw',
                  height: '1.2vw',
                  backgroundColor: '#3D5A4C',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#fff', fontSize: '0.7vw' }}>✓</span>
                </div>
              )}
              
              <p style={{
                fontSize: '1.8vw',
                margin: 0,
                marginBottom: '0.5vw',
                filter: achievement.earned ? 'none' : 'grayscale(100%)'
              }}>
                {achievement.icon}
              </p>
              <p style={{
                fontSize: '0.9vw',
                fontWeight: 500,
                color: achievement.earned ? '#1a1a1a' : '#999',
                margin: 0,
                marginBottom: '0.3vw'
              }}>
                {achievement.title}
              </p>
              <p style={{
                fontSize: '0.75vw',
                color: '#666',
                margin: 0,
                lineHeight: 1.4
              }}>
                {achievement.description}
              </p>
              
              {achievement.earned ? (
                <p style={{ fontSize: '0.7vw', color: '#3D5A4C', margin: '0.5vw 0 0 0' }}>
                  Earned {achievement.earnedDate}
                </p>
              ) : (
                <div style={{ marginTop: '0.5vw' }}>
                  <div style={{
                    height: '0.3vw',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '0.15vw',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${((achievement.progress || 0) / (achievement.total || 1)) * 100}%`,
                      backgroundColor: '#999',
                      borderRadius: '0.15vw'
                    }} />
                  </div>
                  <p style={{ fontSize: '0.7vw', color: '#999', margin: '0.2vw 0 0 0' }}>
                    {achievement.progress}/{achievement.total}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Summary */}
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
          Summary
        </h2>

        {/* Key Insight */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <p style={{ fontSize: '0.85vw', fontWeight: 500, color: '#3D5A4C', margin: 0, marginBottom: '0.5vw' }}>
            💡 Key Insight
          </p>
          <p style={{ fontSize: '0.85vw', color: '#333', margin: 0, lineHeight: 1.6 }}>
            You often enter the Drama Triangle as a <strong>Rescuer</strong>. 
            This week, you've successfully shifted to <strong>Caring</strong> 75% of the time!
          </p>
        </div>

        {/* Learning Progress */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#f9f9f9',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <p style={{ fontSize: '0.85vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.8vw' }}>
            📚 Learning Progress
          </p>
          
          {[
            { name: 'Drama Triangle', progress: 100 },
            { name: 'Compassion Triangle', progress: 75 },
            { name: 'Role Switches', progress: 0 },
          ].map((course, i) => (
            <div key={i} style={{ marginBottom: '0.8vw' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2vw' }}>
                <span style={{ fontSize: '0.8vw', color: '#666' }}>{course.name}</span>
                <span style={{ fontSize: '0.8vw', color: '#666' }}>{course.progress}%</span>
              </div>
              <div style={{
                height: '0.4vw',
                backgroundColor: '#e0e0e0',
                borderRadius: '0.2vw',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${course.progress}%`,
                  backgroundColor: '#3D5A4C',
                  borderRadius: '0.2vw'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Achievements */}
        <div style={{ marginBottom: '1.5vw' }}>
          <p style={{ fontSize: '0.85vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.8vw' }}>
            🏆 Recent Achievements
          </p>
          
          {ACHIEVEMENTS.filter(a => a.earned).slice(0, 3).map((achievement, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8vw',
              padding: '0.6vw 0',
              borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none'
            }}>
              <span style={{ fontSize: '1.2vw' }}>{achievement.icon}</span>
              <div>
                <p style={{ fontSize: '0.85vw', color: '#333', margin: 0 }}>{achievement.title}</p>
                <p style={{ fontSize: '0.7vw', color: '#999', margin: 0 }}>{achievement.earnedDate}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <Link
          href="/actions"
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
          ✅ View All Actions
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
          📝 Today's Journal
        </Link>
      </div>
    </div>
  )
}