'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
  { id: 'fable', name: 'Fable', description: 'Expressive storyteller' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear and gentle' },
]

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

export default function SettingsPage() {
  const router = useRouter()
  
  // Profile
  const [name, setName] = useState('Friend')
  const [email, setEmail] = useState('friend@example.com')
  
  // Voice Settings
  const [selectedVoice, setSelectedVoice] = useState('nova')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  
  // Language
  const [language, setLanguage] = useState('en')
  
  // Notifications
  const [dailyReminder, setDailyReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [streakAlerts, setStreakAlerts] = useState(true)
  
  // Privacy
  const [shareAnonymousData, setShareAnonymousData] = useState(false)
  
  // UI State
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  const handleSave = () => {
    // In real app, save to database
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const testVoice = async (voiceId: string) => {
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: 'Hello! This is how I sound as your coach.', 
          voice: voiceId,
          speed: voiceSpeed
        })
      })
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error('Voice test error:', error)
    }
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
              <span style={{ color: '#ffffff', fontSize: '1vw', fontFamily: 'Georgia, serif' }}>
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ color: '#ffffff', fontSize: '0.9vw', margin: 0 }}>{name}</p>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8vw' }}>
                ⚙️ Settings
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
        <div style={{ 
          marginBottom: '2vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '2vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0
            }}>
              Settings
            </h1>
            <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
              Customize your experience
            </p>
          </div>

          {saved && (
            <div style={{
              padding: '0.8vw 1.5vw',
              backgroundColor: '#F0F7F4',
              color: '#3D5A4C',
              borderRadius: '0.5vw',
              fontSize: '0.9vw',
              fontWeight: 500
            }}>
              ✓ Settings saved!
            </div>
          )}
        </div>

        {/* Settings Sections Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5vw',
          marginBottom: '2vw',
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: '1vw'
        }}>
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'voice', label: '🔊 Voice' },
            { id: 'language', label: '🌍 Language' },
            { id: 'notifications', label: '🔔 Notifications' },
            { id: 'privacy', label: '🔒 Privacy' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '0.7vw 1.2vw',
                fontSize: '0.9vw',
                backgroundColor: activeSection === section.id ? '#3D5A4C' : 'transparent',
                color: activeSection === section.id ? '#ffffff' : '#666',
                border: 'none',
                borderRadius: '0.4vw',
                cursor: 'pointer',
                fontWeight: activeSection === section.id ? 500 : 400
              }}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Profile Information
            </h2>

            {/* Avatar */}
            <div style={{ marginBottom: '2vw', display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
              <div style={{
                width: '5vw',
                height: '5vw',
                borderRadius: '50%',
                backgroundColor: '#3D5A4C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#ffffff', fontSize: '2vw', fontFamily: 'Georgia, serif' }}>
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <button style={{
                  padding: '0.6vw 1.2vw',
                  fontSize: '0.85vw',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '0.4vw',
                  cursor: 'pointer',
                  marginRight: '0.5vw'
                }}>
                  Change Photo
                </button>
                <button style={{
                  padding: '0.6vw 1.2vw',
                  fontSize: '0.85vw',
                  backgroundColor: 'transparent',
                  color: '#999',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.4vw',
                  cursor: 'pointer'
                }}>
                  Remove
                </button>
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ 
                fontSize: '0.9vw', 
                fontWeight: 500, 
                color: '#333', 
                display: 'block', 
                marginBottom: '0.5vw' 
              }}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '25vw',
                  padding: '0.8vw 1vw',
                  fontSize: '0.95vw',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5vw',
                  fontFamily: 'inherit'
                }}
              />
              <p style={{ fontSize: '0.8vw', color: '#999', margin: '0.3vw 0 0 0' }}>
                This is how the coach will address you
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ 
                fontSize: '0.9vw', 
                fontWeight: 500, 
                color: '#333', 
                display: 'block', 
                marginBottom: '0.5vw' 
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '25vw',
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
              onClick={handleSave}
              style={{
                padding: '0.8vw 2vw',
                fontSize: '0.95vw',
                fontWeight: 500,
                backgroundColor: '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Voice Section */}
        {activeSection === 'voice' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Voice Settings
            </h2>

            {/* Voice Selection */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ 
                fontSize: '0.9vw', 
                fontWeight: 500, 
                color: '#333', 
                display: 'block', 
                marginBottom: '0.8vw' 
              }}>
                Coach Voice
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1vw'
              }}>
                {VOICES.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    style={{
                      padding: '1vw',
                      backgroundColor: selectedVoice === voice.id ? '#F0F7F4' : '#f9f9f9',
                      border: '2px solid',
                      borderColor: selectedVoice === voice.id ? '#3D5A4C' : '#e0e0e0',
                      borderRadius: '0.5vw',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ 
                        fontSize: '0.95vw', 
                        fontWeight: 500, 
                        color: '#333', 
                        margin: 0 
                      }}>
                        {voice.name}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); testVoice(voice.id) }}
                        style={{
                          padding: '0.3vw 0.6vw',
                          fontSize: '0.75vw',
                          backgroundColor: '#3D5A4C',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0.3vw',
                          cursor: 'pointer'
                        }}
                      >
                        ▶ Test
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>
                      {voice.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Speed */}
            <div style={{ marginBottom: '2vw' }}>
              <label style={{ 
                fontSize: '0.9vw', 
                fontWeight: 500, 
                color: '#333', 
                display: 'block', 
                marginBottom: '0.5vw' 
              }}>
                Voice Speed: {voiceSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  maxWidth: '20vw'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '20vw' }}>
                <span style={{ fontSize: '0.75vw', color: '#999' }}>Slower</span>
                <span style={{ fontSize: '0.75vw', color: '#999' }}>Faster</span>
              </div>
            </div>

            {/* Auto-Speak Toggle */}
            <div style={{ marginBottom: '2vw' }}>
              <div 
                onClick={() => setAutoSpeak(!autoSpeak)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1vw',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '3vw',
                  height: '1.6vw',
                  backgroundColor: autoSpeak ? '#3D5A4C' : '#ccc',
                  borderRadius: '0.8vw',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '1.2vw',
                    height: '1.2vw',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '0.2vw',
                    left: autoSpeak ? '1.6vw' : '0.2vw',
                    transition: 'left 0.2s'
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.95vw', fontWeight: 500, color: '#333', margin: 0 }}>
                    Auto-speak responses
                  </p>
                  <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
                    Automatically read coach responses aloud
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '0.8vw 2vw',
                fontSize: '0.95vw',
                fontWeight: 500,
                backgroundColor: '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Language Section */}
        {activeSection === 'language' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Language Preferences
            </h2>

            <div style={{ marginBottom: '2vw' }}>
              <label style={{ 
                fontSize: '0.9vw', 
                fontWeight: 500, 
                color: '#333', 
                display: 'block', 
                marginBottom: '0.8vw' 
              }}>
                Coaching Language
              </label>
              <p style={{ fontSize: '0.85vw', color: '#666', marginBottom: '1vw' }}>
                The coach will respond in your selected language
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.8vw'
              }}>
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      padding: '0.8vw 1vw',
                      backgroundColor: language === lang.code ? '#F0F7F4' : '#f9f9f9',
                      border: '2px solid',
                      borderColor: language === lang.code ? '#3D5A4C' : '#e0e0e0',
                      borderRadius: '0.5vw',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5vw'
                    }}
                  >
                    <span style={{ fontSize: '1.2vw' }}>{lang.flag}</span>
                    <span style={{ fontSize: '0.9vw', color: '#333' }}>{lang.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '0.8vw 2vw',
                fontSize: '0.95vw',
                fontWeight: 500,
                backgroundColor: '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Notification Settings
            </h2>

            {/* Daily Reminder */}
            <div style={{ marginBottom: '1.5vw' }}>
              <div 
                onClick={() => setDailyReminder(!dailyReminder)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1vw',
                  cursor: 'pointer',
                  marginBottom: '0.8vw'
                }}
              >
                <div style={{
                  width: '3vw',
                  height: '1.6vw',
                  backgroundColor: dailyReminder ? '#3D5A4C' : '#ccc',
                  borderRadius: '0.8vw',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '1.2vw',
                    height: '1.2vw',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '0.2vw',
                    left: dailyReminder ? '1.6vw' : '0.2vw',
                    transition: 'left 0.2s'
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.95vw', fontWeight: 500, color: '#333', margin: 0 }}>
                    Daily check-in reminder
                  </p>
                  <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
                    Get reminded to journal each day
                  </p>
                </div>
              </div>

              {dailyReminder && (
                <div style={{ marginLeft: '4vw' }}>
                  <label style={{ fontSize: '0.85vw', color: '#666', marginRight: '0.5vw' }}>
                    Reminder time:
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    style={{
                      padding: '0.4vw 0.8vw',
                      fontSize: '0.9vw',
                      border: '1px solid #e0e0e0',
                      borderRadius: '0.4vw'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Weekly Digest */}
            <div 
              onClick={() => setWeeklyDigest(!weeklyDigest)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1vw',
                cursor: 'pointer',
                marginBottom: '1.5vw'
              }}
            >
              <div style={{
                width: '3vw',
                height: '1.6vw',
                backgroundColor: weeklyDigest ? '#3D5A4C' : '#ccc',
                borderRadius: '0.8vw',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '1.2vw',
                  height: '1.2vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '0.2vw',
                  left: weeklyDigest ? '1.6vw' : '0.2vw',
                  transition: 'left 0.2s'
                }} />
              </div>
              <div>
                <p style={{ fontSize: '0.95vw', fontWeight: 500, color: '#333', margin: 0 }}>
                  Weekly progress digest
                </p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
                  Receive a summary of your progress each week
                </p>
              </div>
            </div>

            {/* Streak Alerts */}
            <div 
              onClick={() => setStreakAlerts(!streakAlerts)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1vw',
                cursor: 'pointer',
                marginBottom: '2vw'
              }}
            >
              <div style={{
                width: '3vw',
                height: '1.6vw',
                backgroundColor: streakAlerts ? '#3D5A4C' : '#ccc',
                borderRadius: '0.8vw',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '1.2vw',
                  height: '1.2vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '0.2vw',
                  left: streakAlerts ? '1.6vw' : '0.2vw',
                  transition: 'left 0.2s'
                }} />
              </div>
              <div>
                <p style={{ fontSize: '0.95vw', fontWeight: 500, color: '#333', margin: 0 }}>
                  Streak alerts
                </p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
                  Get notified when your streak is at risk
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '0.8vw 2vw',
                fontSize: '0.95vw',
                fontWeight: 500,
                backgroundColor: '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1vw',
            padding: '2vw',
            border: '1px solid #e8e8e8'
          }}>
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              margin: 0,
              marginBottom: '1.5vw'
            }}>
              Privacy & Data
            </h2>

            {/* Anonymous Data */}
            <div 
              onClick={() => setShareAnonymousData(!shareAnonymousData)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1vw',
                cursor: 'pointer',
                marginBottom: '2vw'
              }}
            >
              <div style={{
                width: '3vw',
                height: '1.6vw',
                backgroundColor: shareAnonymousData ? '#3D5A4C' : '#ccc',
                borderRadius: '0.8vw',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '1.2vw',
                  height: '1.2vw',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '0.2vw',
                  left: shareAnonymousData ? '1.6vw' : '0.2vw',
                  transition: 'left 0.2s'
                }} />
              </div>
              <div>
                <p style={{ fontSize: '0.95vw', fontWeight: 500, color: '#333', margin: 0 }}>
                  Share anonymous usage data
                </p>
                <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
                  Help improve the app with anonymous analytics
                </p>
              </div>
            </div>

            {/* Data Export */}
            <div style={{
              padding: '1.5vw',
              backgroundColor: '#f9f9f9',
              borderRadius: '0.8vw',
              marginBottom: '1.5vw'
            }}>
              <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.5vw' }}>
                Export Your Data
              </h3>
              <p style={{ fontSize: '0.85vw', color: '#666', margin: 0, marginBottom: '1vw' }}>
                Download all your journal entries, coaching sessions, and progress data.
              </p>
              <button style={{
                padding: '0.6vw 1.2vw',
                fontSize: '0.85vw',
                backgroundColor: '#ffffff',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '0.4vw',
                cursor: 'pointer'
              }}>
                📥 Export Data
              </button>
            </div>

            {/* Delete Account */}
            <div style={{
              padding: '1.5vw',
              backgroundColor: '#FFF5F5',
              borderRadius: '0.8vw',
              border: '1px solid #FFCCCC'
            }}>
              <h3 style={{ fontSize: '1vw', fontWeight: 500, color: '#A85454', margin: 0, marginBottom: '0.5vw' }}>
                Delete Account
              </h3>
              <p style={{ fontSize: '0.85vw', color: '#666', margin: 0, marginBottom: '1vw' }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button style={{
                padding: '0.6vw 1.2vw',
                fontSize: '0.85vw',
                backgroundColor: '#A85454',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.4vw',
                cursor: 'pointer'
              }}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Help */}
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
          Help & Support
        </h2>

        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F5F5FF',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#4B0082', margin: 0, marginBottom: '0.5vw' }}>
            📚 User Guide
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
            Learn how to get the most out of Drama Triangle Coach
          </p>
        </div>

        <div style={{
          padding: '1.2vw',
          backgroundColor: '#f9f9f9',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.5vw' }}>
            💬 Contact Support
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
            Have questions? We're here to help.
          </p>
        </div>

        <div style={{
          padding: '1.2vw',
          backgroundColor: '#f9f9f9',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#333', margin: 0, marginBottom: '0.5vw' }}>
            🐛 Report a Bug
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0 }}>
            Found something that's not working right?
          </p>
        </div>

        {/* About */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw'
        }}>
          <h3 style={{ fontSize: '0.9vw', fontWeight: 500, color: '#3D5A4C', margin: 0, marginBottom: '0.8vw' }}>
            About
          </h3>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: 0, marginBottom: '0.5vw' }}>
            Drama Triangle Coach
          </p>
          <p style={{ fontSize: '0.75vw', color: '#999', margin: 0, marginBottom: '0.5vw' }}>
            Version 1.0.0
          </p>
          <p style={{ fontSize: '0.75vw', color: '#999', margin: 0 }}>
            Based on the work of Dr. Stephen Karpman
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            padding: '1vw',
            marginTop: '2vw',
            fontSize: '0.9vw',
            backgroundColor: 'transparent',
            color: '#A85454',
            border: '1px solid #A85454',
            borderRadius: '0.5vw',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}