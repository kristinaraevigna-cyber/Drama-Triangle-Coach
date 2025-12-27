'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('Friend')
  const [userInitial, setUserInitial] = useState<string>('F')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Try to get name from user metadata (set during signup)
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Friend'
        setUserName(name)
        setUserInitial(name.charAt(0).toUpperCase())
      }
    }
    
    getUser()
  }, [])

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
        {/* Logo */}
        <div style={{ padding: '0 2vw', marginBottom: '4vw' }}>
          <div 
            onClick={() => router.push('/dashboard')} 
            style={{ cursor: 'pointer' }}
          >
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
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '0 2vw 2vw 2vw'
        }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard', active: true },
            { name: 'Compassion Coach', href: '/coach', active: false },
            { name: 'Mentor Coach', href: '/mentor', active: false },
            { name: 'Learn', href: '/learn', active: false },
            { name: 'Practice', href: '/practice', active: false },
            { name: 'Journal', href: '/journal', active: false },
            { name: 'Progress', href: '/progress', active: false },
            { name: 'Actions', href: '/actions', active: false },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => router.push(item.href)}
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
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div style={{ padding: '0 2vw' }}>
          <div style={{
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginBottom: '2vw'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{
              width: '2.5vw',
              height: '2.5vw',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#ffffff', fontSize: '1vw', fontFamily: 'Georgia, serif' }}>{userInitial}</span>
            </div>
            <div>
              <p style={{ color: '#ffffff', fontSize: '0.9vw', margin: 0 }}>{userName}</p>
              <span 
                onClick={() => router.push('/settings')} 
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8vw', cursor: 'pointer' }}
              >
                Settings
              </span>
            </div>
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
        <div style={{ marginBottom: '2.5vw' }}>
          <h1 style={{
            fontSize: '2vw',
            fontWeight: 500,
            color: '#1a1a1a',
            fontFamily: 'Georgia, serif',
            margin: 0
          }}>
            Welcome back, {userName}
          </h1>
          <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
            Continue your journey from drama to compassion
          </p>
        </div>

        {/* Quick Actions - 4 Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5vw',
          marginBottom: '2.5vw'
        }}>
          {/* Compassion Coach Card */}
          <div 
            onClick={() => router.push('/coach')}
            style={{
              height: '12vw',
              borderRadius: '1vw',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              backgroundImage: 'url(https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(61,90,76,0.95), rgba(61,90,76,0.7))',
              padding: '1.5vw',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8vw', margin: 0, marginBottom: '0.3vw' }}>
                🎯 Coaching Session
              </p>
              <h3 style={{ color: '#ffffff', fontSize: '1.1vw', fontWeight: 500, margin: 0, fontFamily: 'Georgia, serif' }}>
                Compassion Coach
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8vw', margin: 0, marginTop: '0.3vw' }}>
                Work through personal situations
              </p>
            </div>
          </div>

          {/* Mentor Coach Card */}
          <div 
            onClick={() => router.push('/mentor')}
            style={{
              height: '12vw',
              borderRadius: '1vw',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              backgroundImage: 'url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(75,0,130,0.95), rgba(75,0,130,0.7))',
              padding: '1.5vw',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8vw', margin: 0, marginBottom: '0.3vw' }}>
                📚 Learn & Advice
              </p>
              <h3 style={{ color: '#ffffff', fontSize: '1.1vw', fontWeight: 500, margin: 0, fontFamily: 'Georgia, serif' }}>
                Mentor Coach
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8vw', margin: 0, marginTop: '0.3vw' }}>
                Get teaching & guidance
              </p>
            </div>
          </div>

          {/* Daily Check-in Card */}
          <div 
            onClick={() => router.push('/journal')}
            style={{
              height: '12vw',
              borderRadius: '1vw',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(139,69,19,0.95), rgba(139,69,19,0.7))',
              padding: '1.5vw',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8vw', margin: 0, marginBottom: '0.3vw' }}>
                ✍️ Reflect
              </p>
              <h3 style={{ color: '#ffffff', fontSize: '1.1vw', fontWeight: 500, margin: 0, fontFamily: 'Georgia, serif' }}>
                Daily Check-in
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8vw', margin: 0, marginTop: '0.3vw' }}>
                Journal your progress
              </p>
            </div>
          </div>

          {/* Continue Learning Card */}
          <div 
            onClick={() => router.push('/learn')}
            style={{
              height: '12vw',
              borderRadius: '1vw',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              backgroundImage: 'url(https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(30,58,95,0.95), rgba(30,58,95,0.7))',
              padding: '1.5vw',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8vw', margin: 0, marginBottom: '0.3vw' }}>
                📖 Course
              </p>
              <h3 style={{ color: '#ffffff', fontSize: '1.1vw', fontWeight: 500, margin: 0, fontFamily: 'Georgia, serif' }}>
                Continue Learning
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8vw', margin: 0, marginTop: '0.3vw' }}>
                Compassion Triangle
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2vw'
        }}>
          {/* Left Column - Learning Progress */}
          <div>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1.5vw'
            }}>
              Learning Progress
            </h2>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1vw',
              padding: '1.5vw',
              border: '1px solid #e8e8e8'
            }}>
              {[
                { name: 'Drama Triangle', progress: 100, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
                { name: 'Compassion Triangle', progress: 60, image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=100' },
                { name: 'Scales of Intimacy', progress: 0, image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=100' },
                { name: 'The Options', progress: 0, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100' },
                { name: 'Trust Contract', progress: 0, image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=100' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1vw',
                  padding: '1vw 0',
                  borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{
                    width: '3vw',
                    height: '3vw',
                    borderRadius: '0.5vw',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0, marginBottom: '0.4vw' }}>
                      {item.name}
                    </p>
                    <div style={{
                      height: '0.4vw',
                      backgroundColor: '#e8e8e8',
                      borderRadius: '0.2vw',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.progress}%`,
                        backgroundColor: item.progress === 100 ? '#3D5A4C' : '#8FBC8F',
                        borderRadius: '0.2vw'
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85vw', color: '#666' }}>{item.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Recent Sessions & Coach Comparison */}
          <div>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1.5vw'
            }}>
              Recent Sessions
            </h2>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1vw',
              padding: '1.5vw',
              border: '1px solid #e8e8e8',
              marginBottom: '1.5vw'
            }}>
              {[
                { topic: 'Setting boundaries at work', date: 'Today', duration: '15 min', type: 'coach' },
                { topic: 'Drama Triangle basics', date: 'Yesterday', duration: '20 min', type: 'mentor' },
                { topic: 'Recognizing rescuer patterns', date: 'Dec 23', duration: '12 min', type: 'coach' },
              ].map((session, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1vw 0',
                  borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
                    <div style={{
                      width: '2vw',
                      height: '2vw',
                      borderRadius: '50%',
                      backgroundColor: session.type === 'coach' ? '#3D5A4C' : '#4B0082',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.7vw' }}>
                        {session.type === 'coach' ? '🎯' : '📚'}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0 }}>{session.topic}</p>
                      <p style={{ fontSize: '0.8vw', color: '#999', margin: 0, marginTop: '0.2vw' }}>
                        {session.type === 'coach' ? 'Coaching' : 'Mentor'} • {session.date}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85vw', color: '#666' }}>{session.duration}</span>
                </div>
              ))}
            </div>

            {/* Coach Comparison Box */}
            <div style={{
              backgroundColor: '#F5F5FF',
              borderRadius: '1vw',
              padding: '1.5vw',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '1vw',
                fontWeight: 500,
                color: '#4B0082',
                margin: 0,
                marginBottom: '1vw'
              }}>
                Which coach should I use?
              </h3>
              
              <div style={{ display: 'flex', gap: '1vw' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5vw',
                    marginBottom: '0.5vw'
                  }}>
                    <div style={{
                      width: '1.5vw',
                      height: '1.5vw',
                      borderRadius: '50%',
                      backgroundColor: '#3D5A4C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.6vw' }}>🎯</span>
                    </div>
                    <span style={{ fontSize: '0.85vw', fontWeight: 500, color: '#3D5A4C' }}>Compassion Coach</span>
                  </div>
                  <p style={{ fontSize: '0.75vw', color: '#666', margin: 0, lineHeight: 1.5 }}>
                    For working through personal situations with powerful questions
                  </p>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5vw',
                    marginBottom: '0.5vw'
                  }}>
                    <div style={{
                      width: '1.5vw',
                      height: '1.5vw',
                      borderRadius: '50%',
                      backgroundColor: '#4B0082',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.6vw' }}>📚</span>
                    </div>
                    <span style={{ fontSize: '0.85vw', fontWeight: 500, color: '#4B0082' }}>Mentor Coach</span>
                  </div>
                  <p style={{ fontSize: '0.75vw', color: '#666', margin: 0, lineHeight: 1.5 }}>
                    For learning concepts and getting direct advice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1.5vw',
          marginTop: '2.5vw'
        }}>
          {[
            { label: 'Day Streak', value: '7', icon: '🔥' },
            { label: 'Coaching Sessions', value: '12', icon: '🎯' },
            { label: 'Mentor Sessions', value: '5', icon: '📚' },
            { label: 'Actions Completed', value: '6/10', icon: '✅' },
            { label: 'Concepts Learned', value: '2/11', icon: '✓' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              borderRadius: '1vw',
              padding: '1.5vw',
              border: '1px solid #e8e8e8',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '2vw', margin: 0, marginBottom: '0.5vw' }}>{stat.icon}</p>
              <p style={{
                fontSize: '1.8vw',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: 0
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.85vw', color: '#666', margin: 0, marginTop: '0.3vw' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Actions Preview */}
        <div style={{ marginTop: '2.5vw' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5vw'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0
            }}>
              Pending Actions
            </h2>
            <span 
              onClick={() => router.push('/actions')}
              style={{
                fontSize: '0.9vw',
                color: '#3D5A4C',
                cursor: 'pointer'
              }}
            >
              View all →
            </span>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '1.5vw',
            border: '1px solid #e8e8e8'
          }}>
            {[
              { action: 'Use "I feel... when... I need..." format in Monday meeting', timeline: 'Monday', session: 'Assertive communication' },
              { action: 'Ask "How can I support you?" instead of jumping in to fix', timeline: 'This week', session: 'From Rescuer to Caring' },
              { action: 'Take 3 deep breaths before responding when triggered', timeline: 'Ongoing', session: 'Managing reactivity' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1vw',
                padding: '1vw 0',
                borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div style={{
                  width: '1.5vw',
                  height: '1.5vw',
                  borderRadius: '50%',
                  border: '2px solid #ccc',
                  flexShrink: 0,
                  marginTop: '0.2vw'
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.95vw', color: '#1a1a1a', margin: 0, lineHeight: 1.5 }}>
                    {item.action}
                  </p>
                  <p style={{ fontSize: '0.8vw', color: '#999', margin: 0, marginTop: '0.3vw' }}>
                    {item.session} • Due: {item.timeline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
