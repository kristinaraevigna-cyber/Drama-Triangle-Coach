'use client'

import { useRouter } from 'next/navigation'
import { VoiceChat } from '@/components/coach/VoiceChat'

export default function CoachPage() {
  const router = useRouter()

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
          <div onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
            <h1 style={{
              fontSize: '1.3vw',
              fontWeight: 400,
              color: '#ffffff',
              fontFamily: 'Georgia, serif'
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

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Compassion Coach', href: '/coach', active: true },
            { name: 'Mentor Coach', href: '/mentor' },
            { name: 'Learn', href: '/learn' },
            { name: 'Practice', href: '/practice' },
            { name: 'Journal', href: '/journal' },
            { name: 'Progress', href: '/progress' },
            { name: 'Actions', href: '/actions' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => router.push(item.href)}
              style={{
                padding: '1vw 1.5vw',
                marginBottom: '0.3vw',
                borderRadius: '0.4vw',
                backgroundColor: item.active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: item.active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontSize: '1vw',
                cursor: 'pointer'
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - Direct Voice Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <VoiceChat />
      </div>
    </div>
  )
}
  )
}
