'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Scenario {
  id: string
  category: string
  title: string
  situation: string
  personA: string
  personB: string
  correctRole: 'victim' | 'persecutor' | 'rescuer'
  explanation: string
  compassionResponse: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface Exercise {
  id: string
  type: 'identify' | 'respond' | 'reframe'
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  completed: number
  total: number
}

const SCENARIOS: Scenario[] = [
  {
    id: '1',
    category: 'Work',
    title: 'The Overloaded Colleague',
    situation: 'Your colleague Sarah is overwhelmed with work and complaining about her impossible deadline.',
    personA: 'Sarah',
    personB: '"I have so much to do and nobody helps me. I\'ll never finish this in time. My boss always dumps everything on me!"',
    correctRole: 'victim',
    explanation: 'Sarah is in Victim mode - she feels helpless, blames external circumstances, and isn\'t taking ownership of possible solutions. Key phrases: "nobody helps me," "I\'ll never," "always dumps on me."',
    compassionResponse: 'A Vulnerable response would be: "I\'m feeling overwhelmed with this deadline. I need to talk to my boss about priorities, or ask for help with specific tasks."',
    difficulty: 'beginner'
  },
  {
    id: '2',
    category: 'Work',
    title: 'The Critical Manager',
    situation: 'During a team meeting, your manager responds to a project update.',
    personA: 'Manager',
    personB: '"This is completely unacceptable. You clearly didn\'t think this through. I don\'t know why I have to explain everything to you people."',
    correctRole: 'persecutor',
    explanation: 'The manager is in Persecutor mode - attacking, blaming, and using "you" statements to criticize rather than addressing the issue constructively. Key phrases: "completely unacceptable," "you clearly didn\'t," "you people."',
    compassionResponse: 'An Assertive response would be: "I\'m concerned about the timeline. Let\'s identify the specific gaps and discuss how we can address them together."',
    difficulty: 'beginner'
  },
  {
    id: '3',
    category: 'Family',
    title: 'The Helpful Parent',
    situation: 'Your adult child mentions they\'re having trouble managing their finances.',
    personA: 'Parent',
    personB: '"Oh honey, don\'t worry about it. Just let me look at your accounts and I\'ll sort it all out for you. You shouldn\'t have to deal with this stress."',
    correctRole: 'rescuer',
    explanation: 'The parent is in Rescuer mode - jumping in to fix without being asked, implying the adult child can\'t handle it themselves. Key phrases: "let me sort it out for you," "you shouldn\'t have to deal with this."',
    compassionResponse: 'A Caring response would be: "That sounds stressful. Would you like to talk through some options together? I\'m happy to share what\'s worked for me if that would help."',
    difficulty: 'beginner'
  },
  {
    id: '4',
    category: 'Relationships',
    title: 'The Blamed Partner',
    situation: 'Your partner forgot to make dinner reservations for your anniversary.',
    personA: 'You',
    personB: '"You always forget the important things. You obviously don\'t care about our relationship. I don\'t know why I even bother."',
    correctRole: 'persecutor',
    explanation: 'This is Persecutor mode - using "always" statements, attacking character ("you obviously don\'t care"), and dramatizing ("why I even bother"). The hurt is valid, but the expression attacks rather than shares.',
    compassionResponse: 'An Assertive response would be: "I feel hurt that the reservation wasn\'t made. Our anniversary is important to me. Can we talk about how to make sure we both remember important dates?"',
    difficulty: 'intermediate'
  },
  {
    id: '5',
    category: 'Family',
    title: 'The Guilt Trip',
    situation: 'You tell your mother you can\'t come to Sunday dinner this week.',
    personA: 'Mother',
    personB: '"Fine. I\'ll just sit here alone again. Nobody has time for me anymore. I guess I\'m just not important to this family."',
    correctRole: 'victim',
    explanation: 'This is Victim mode being used manipulatively - using guilt and helplessness to control the situation. Key phrases: "sit here alone," "nobody has time," "not important." This is sometimes called "Victim-as-Persecutor."',
    compassionResponse: 'A Vulnerable response would be: "I miss seeing you too, and I feel sad when we can\'t connect. Could we plan a phone call this week, or find another day that works?"',
    difficulty: 'intermediate'
  },
  {
    id: '6',
    category: 'Work',
    title: 'The Mediating Coworker',
    situation: 'Two colleagues are in conflict. A third colleague steps in.',
    personA: 'Coworker',
    personB: '"Don\'t worry, I\'ll talk to them for you. You shouldn\'t have to deal with their attitude. I\'ll smooth everything over - I\'m good at handling difficult people."',
    correctRole: 'rescuer',
    explanation: 'This is Rescuer mode - inserting themselves into a conflict without being asked, taking over a problem that isn\'t theirs, and positioning themselves as the capable fixer. Key phrases: "I\'ll talk to them for you," "I\'ll smooth everything over."',
    compassionResponse: 'A Caring response would be: "That sounds like a tough situation. Have you thought about what you want to say to them directly? I\'m happy to help you practice the conversation if you\'d like."',
    difficulty: 'intermediate'
  },
  {
    id: '7',
    category: 'Relationships',
    title: 'The Silent Treatment',
    situation: 'After a disagreement, your partner withdraws.',
    personA: 'Partner',
    personB: '*Sighs heavily* "Nothing. I\'m fine. It doesn\'t matter what I think anyway. You\'re going to do what you want regardless of how I feel."',
    correctRole: 'victim',
    explanation: 'This is passive Victim mode - withdrawing, denying feelings while clearly expressing them through tone and body language, and making the other person responsible for their emotional state.',
    compassionResponse: 'A Vulnerable response would be: "I\'m feeling hurt and I need some time to process. Can we talk about this in an hour when I\'ve had time to think about what I really need?"',
    difficulty: 'advanced'
  },
  {
    id: '8',
    category: 'Work',
    title: 'The Micromanager',
    situation: 'Your manager reviews your completed project.',
    personA: 'Manager',
    personB: '"Let me just fix these few things. Actually, I\'ll redo this whole section - it\'ll be faster if I just do it myself. You\'ve done your best, but this needs to be perfect."',
    correctRole: 'rescuer',
    explanation: 'This is Rescuer mode disguised as helpfulness - taking over work, implying the employee can\'t do it well enough, and undermining their autonomy with "I\'ll just do it myself." The backhanded compliment ("You\'ve done your best") is also a tell.',
    compassionResponse: 'A Caring response would be: "There are some areas I think could be stronger. Let me show you specifically what I\'m looking for, and then you can revise it. What questions do you have?"',
    difficulty: 'advanced'
  },
]

const EXERCISES: Exercise[] = [
  {
    id: 'identify',
    type: 'identify',
    title: 'Identify the Role',
    description: 'Read scenarios and identify which Drama Triangle role is being played',
    icon: '🔍',
    color: '#8B4513',
    bgColor: '#FFF8F0',
    completed: 3,
    total: 8
  },
  {
    id: 'respond',
    type: 'respond',
    title: 'Compassion Response',
    description: 'Practice responding from the Compassion Triangle',
    icon: '💬',
    color: '#3D5A4C',
    bgColor: '#F0F7F4',
    completed: 1,
    total: 8
  },
  {
    id: 'reframe',
    type: 'reframe',
    title: 'Reframe the Drama',
    description: 'Transform Drama Triangle statements into Compassion Triangle responses',
    icon: '🔄',
    color: '#4B0082',
    bgColor: '#F5F5FF',
    completed: 0,
    total: 8
  },
]

const ROLE_OPTIONS = [
  { id: 'victim', label: 'Victim', emoji: '😢', color: '#C97B4B' },
  { id: 'persecutor', label: 'Persecutor', emoji: '😠', color: '#A85454' },
  { id: 'rescuer', label: 'Rescuer', emoji: '🦸', color: '#6B8E6B' },
]

export default function PracticePage() {
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [userResponse, setUserResponse] = useState('')
  const [showResponseFeedback, setShowResponseFeedback] = useState(false)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const filteredScenarios = SCENARIOS.filter(s => 
    filter === 'all' || s.difficulty === filter
  )

  const currentScenario = filteredScenarios[currentScenarioIndex]

  const handleAnswerSelect = (roleId: string) => {
    if (showResult) return
    setSelectedAnswer(roleId)
  }

  const checkAnswer = () => {
    if (!selectedAnswer) return
    setShowResult(true)
    setScore(prev => ({
      correct: prev.correct + (selectedAnswer === currentScenario.correctRole ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const nextScenario = () => {
    if (currentScenarioIndex < filteredScenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setUserResponse('')
      setShowResponseFeedback(false)
      setAiFeedback('')
    } else {
      // Exercise complete
      setActiveExercise(null)
      setCurrentScenarioIndex(0)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const getResponseFeedback = async () => {
    if (!userResponse.trim()) return
    setIsLoadingFeedback(true)

    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `I'm practicing Compassion Triangle responses. Here's the scenario:

SITUATION: ${currentScenario.situation}
THE OTHER PERSON SAID: ${currentScenario.personB}
THEY WERE IN: ${currentScenario.correctRole.toUpperCase()} mode

MY RESPONSE: "${userResponse}"

Please give me brief, constructive feedback (2-3 sentences):
1. What Compassion Triangle role am I demonstrating (Vulnerable, Assertive, or Caring)?
2. What's working well?
3. One suggestion to make it even better?`
          }],
          userName: 'Learner'
        })
      })

      const data = await response.json()
      setAiFeedback(data.message)
      setShowResponseFeedback(true)
    } catch (error) {
      console.error('Feedback error:', error)
      setAiFeedback('Unable to get feedback right now. Compare your response to the suggested compassion response below.')
      setShowResponseFeedback(true)
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  const resetExercise = () => {
    setActiveExercise(null)
    setCurrentScenarioIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setUserResponse('')
    setShowResponseFeedback(false)
    setAiFeedback('')
    setScore({ correct: 0, total: 0 })
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
            { name: 'Practice', href: '/practice', active: true },
            { name: 'Journal', href: '/journal', active: false },
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
          
          {/* Practice Stats */}
          <div style={{
            padding: '1vw',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '0.5vw'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75vw', marginBottom: '0.5vw' }}>
              Practice Progress
            </p>
            <p style={{ color: '#ffffff', fontSize: '1.1vw', fontWeight: 600, margin: 0 }}>
              {EXERCISES.reduce((sum, e) => sum + e.completed, 0)} / {EXERCISES.reduce((sum, e) => sum + e.total, 0)} scenarios
            </p>
            <div style={{
              height: '0.4vw',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '0.2vw',
              overflow: 'hidden',
              marginTop: '0.5vw'
            }}>
              <div style={{
                height: '100%',
                width: `${(EXERCISES.reduce((sum, e) => sum + e.completed, 0) / EXERCISES.reduce((sum, e) => sum + e.total, 0)) * 100}%`,
                backgroundColor: '#ffffff',
                borderRadius: '0.2vw'
              }} />
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
        {!activeExercise ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: '2vw' }}>
              <h1 style={{
                fontSize: '2vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: 0
              }}>
                Practice
              </h1>
              <p style={{ fontSize: '1vw', color: '#666666', margin: 0, marginTop: '0.5vw' }}>
                Sharpen your skills with interactive scenarios
              </p>
            </div>

            {/* Exercise Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5vw',
              marginBottom: '2.5vw'
            }}>
              {EXERCISES.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => setActiveExercise(exercise.type)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '1vw',
                    padding: '1.5vw',
                    border: '1px solid #e8e8e8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '3vw',
                    height: '3vw',
                    backgroundColor: exercise.bgColor,
                    borderRadius: '0.8vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5vw',
                    marginBottom: '1vw'
                  }}>
                    {exercise.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.1vw',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '0.5vw'
                  }}>
                    {exercise.title}
                  </h3>
                  <p style={{
                    fontSize: '0.85vw',
                    color: '#666',
                    margin: 0,
                    marginBottom: '1vw',
                    lineHeight: 1.5
                  }}>
                    {exercise.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '0.4vw',
                      backgroundColor: '#e8e8e8',
                      borderRadius: '0.2vw',
                      overflow: 'hidden',
                      marginRight: '1vw'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(exercise.completed / exercise.total) * 100}%`,
                        backgroundColor: exercise.color,
                        borderRadius: '0.2vw'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.8vw', color: '#666' }}>
                      {exercise.completed}/{exercise.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Scenarios */}
            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              marginBottom: '1vw'
            }}>
              Quick Practice
            </h2>
            <p style={{ fontSize: '0.9vw', color: '#666', marginBottom: '1.5vw' }}>
              Jump into a scenario to practice identifying Drama Triangle roles
            </p>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5vw', marginBottom: '1.5vw' }}>
              {[
                { key: 'all', label: 'All Levels' },
                { key: 'beginner', label: 'Beginner' },
                { key: 'intermediate', label: 'Intermediate' },
                { key: 'advanced', label: 'Advanced' },
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

            {/* Scenario Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1vw'
            }}>
              {filteredScenarios.map((scenario, index) => (
                <div
                  key={scenario.id}
                  onClick={() => {
                    setActiveExercise('identify')
                    setCurrentScenarioIndex(index)
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.8vw',
                    padding: '1.2vw',
                    border: '1px solid #e8e8e8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.8vw'
                  }}>
                    <span style={{
                      padding: '0.3vw 0.6vw',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '0.3vw',
                      fontSize: '0.75vw',
                      color: '#666'
                    }}>
                      {scenario.category}
                    </span>
                    <span style={{
                      padding: '0.3vw 0.6vw',
                      backgroundColor: scenario.difficulty === 'beginner' ? '#F0F7F4' :
                                       scenario.difficulty === 'intermediate' ? '#FFF8F0' : '#F5F5FF',
                      color: scenario.difficulty === 'beginner' ? '#3D5A4C' :
                             scenario.difficulty === 'intermediate' ? '#8B4513' : '#4B0082',
                      borderRadius: '0.3vw',
                      fontSize: '0.7vw',
                      textTransform: 'capitalize'
                    }}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1vw',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    margin: 0,
                    marginBottom: '0.5vw'
                  }}>
                    {scenario.title}
                  </h3>
                  <p style={{
                    fontSize: '0.85vw',
                    color: '#666',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {scenario.situation.substring(0, 80)}...
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Active Exercise View */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2vw'
            }}>
              <div>
                <button
                  onClick={resetExercise}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '0.9vw',
                    cursor: 'pointer',
                    marginBottom: '0.5vw',
                    padding: 0
                  }}
                >
                  ← Back to Practice
                </button>
                <h1 style={{
                  fontSize: '1.8vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily: 'Georgia, serif',
                  margin: 0
                }}>
                  {activeExercise === 'identify' ? 'Identify the Role' :
                   activeExercise === 'respond' ? 'Compassion Response' : 'Reframe the Drama'}
                </h1>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5vw'
              }}>
                <span style={{ fontSize: '0.9vw', color: '#666' }}>
                  Scenario {currentScenarioIndex + 1} of {filteredScenarios.length}
                </span>
                {score.total > 0 && (
                  <span style={{
                    padding: '0.5vw 1vw',
                    backgroundColor: '#F0F7F4',
                    color: '#3D5A4C',
                    borderRadius: '0.4vw',
                    fontSize: '0.9vw',
                    fontWeight: 500
                  }}>
                    Score: {score.correct}/{score.total}
                  </span>
                )}
              </div>
            </div>

            {/* Scenario Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1vw',
              padding: '2vw',
              border: '1px solid #e8e8e8',
              marginBottom: '1.5vw'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.8vw',
                marginBottom: '1.5vw'
              }}>
                <span style={{
                  padding: '0.4vw 0.8vw',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '0.4vw',
                  fontSize: '0.8vw',
                  color: '#666'
                }}>
                  {currentScenario.category}
                </span>
                <span style={{
                  padding: '0.4vw 0.8vw',
                  backgroundColor: currentScenario.difficulty === 'beginner' ? '#F0F7F4' :
                                   currentScenario.difficulty === 'intermediate' ? '#FFF8F0' : '#F5F5FF',
                  color: currentScenario.difficulty === 'beginner' ? '#3D5A4C' :
                         currentScenario.difficulty === 'intermediate' ? '#8B4513' : '#4B0082',
                  borderRadius: '0.4vw',
                  fontSize: '0.8vw',
                  textTransform: 'capitalize'
                }}>
                  {currentScenario.difficulty}
                </span>
              </div>

              <h2 style={{
                fontSize: '1.3vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: 0,
                marginBottom: '1vw'
              }}>
                {currentScenario.title}
              </h2>

              <p style={{
                fontSize: '1vw',
                color: '#333',
                lineHeight: 1.7,
                marginBottom: '1.5vw'
              }}>
                {currentScenario.situation}
              </p>

              <div style={{
                backgroundColor: '#f9f9f9',
                borderRadius: '0.8vw',
                padding: '1.5vw',
                borderLeft: '4px solid #4B0082'
              }}>
                <p style={{
                  fontSize: '0.85vw',
                  color: '#666',
                  margin: 0,
                  marginBottom: '0.5vw'
                }}>
                  <strong>{currentScenario.personA}</strong> says:
                </p>
                <p style={{
                  fontSize: '1.05vw',
                  color: '#1a1a1a',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {currentScenario.personB}
                </p>
              </div>
            </div>

            {/* Exercise Type: Identify */}
            {activeExercise === 'identify' && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1vw',
                padding: '2vw',
                border: '1px solid #e8e8e8'
              }}>
                <h3 style={{
                  fontSize: '1.1vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  margin: 0,
                  marginBottom: '1.5vw'
                }}>
                  Which Drama Triangle role is {currentScenario.personA} playing?
                </h3>

                <div style={{
                  display: 'flex',
                  gap: '1vw',
                  marginBottom: '1.5vw'
                }}>
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleAnswerSelect(role.id)}
                      disabled={showResult}
                      style={{
                        flex: 1,
                        padding: '1.5vw',
                        backgroundColor: showResult
                          ? role.id === currentScenario.correctRole
                            ? '#F0F7F4'
                            : selectedAnswer === role.id
                              ? '#FFEBEB'
                              : '#f9f9f9'
                          : selectedAnswer === role.id
                            ? '#FFF8F0'
                            : '#f9f9f9',
                        border: '2px solid',
                        borderColor: showResult
                          ? role.id === currentScenario.correctRole
                            ? '#3D5A4C'
                            : selectedAnswer === role.id
                              ? '#A85454'
                              : '#e0e0e0'
                          : selectedAnswer === role.id
                            ? '#8B4513'
                            : '#e0e0e0',
                        borderRadius: '0.8vw',
                        cursor: showResult ? 'default' : 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '2vw', display: 'block', marginBottom: '0.5vw' }}>
                        {role.emoji}
                      </span>
                      <span style={{
                        fontSize: '1vw',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        {role.label}
                      </span>
                      {showResult && role.id === currentScenario.correctRole && (
                        <span style={{
                          display: 'block',
                          marginTop: '0.5vw',
                          fontSize: '0.85vw',
                          color: '#3D5A4C'
                        }}>
                          ✓ Correct
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {!showResult ? (
                  <button
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    style={{
                      width: '100%',
                      padding: '1vw',
                      fontSize: '1vw',
                      fontWeight: 500,
                      backgroundColor: selectedAnswer ? '#3D5A4C' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.5vw',
                      cursor: selectedAnswer ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <div>
                    {/* Explanation */}
                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: selectedAnswer === currentScenario.correctRole ? '#F0F7F4' : '#FFF8F0',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '1vw',
                        fontWeight: 500,
                        color: selectedAnswer === currentScenario.correctRole ? '#3D5A4C' : '#8B4513',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        {selectedAnswer === currentScenario.correctRole ? '✓ Correct!' : '✗ Not quite'}
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0
                      }}>
                        {currentScenario.explanation}
                      </p>
                    </div>

                    {/* Compassion Alternative */}
                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: '#F5F5FF',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '0.9vw',
                        fontWeight: 500,
                        color: '#4B0082',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        💚 Compassion Triangle Alternative
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0
                      }}>
                        {currentScenario.compassionResponse}
                      </p>
                    </div>

                    <button
                      onClick={nextScenario}
                      style={{
                        width: '100%',
                        padding: '1vw',
                        fontSize: '1vw',
                        fontWeight: 500,
                        backgroundColor: '#3D5A4C',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5vw',
                        cursor: 'pointer'
                      }}
                    >
                      {currentScenarioIndex < filteredScenarios.length - 1 ? 'Next Scenario →' : 'Finish Practice'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Exercise Type: Respond */}
            {activeExercise === 'respond' && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1vw',
                padding: '2vw',
                border: '1px solid #e8e8e8'
              }}>
                <h3 style={{
                  fontSize: '1.1vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  margin: 0,
                  marginBottom: '0.5vw'
                }}>
                  How would you respond from the Compassion Triangle?
                </h3>
                <p style={{
                  fontSize: '0.9vw',
                  color: '#666',
                  margin: 0,
                  marginBottom: '1.5vw'
                }}>
                  Practice responding with Vulnerability, Assertiveness, or Caring
                </p>

                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Write your compassionate response..."
                  disabled={showResponseFeedback}
                  style={{
                    width: '100%',
                    padding: '1vw',
                    fontSize: '1vw',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5vw',
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    marginBottom: '1vw'
                  }}
                  rows={4}
                />

                {!showResponseFeedback ? (
                  <button
                    onClick={getResponseFeedback}
                    disabled={!userResponse.trim() || isLoadingFeedback}
                    style={{
                      width: '100%',
                      padding: '1vw',
                      fontSize: '1vw',
                      fontWeight: 500,
                      backgroundColor: userResponse.trim() ? '#3D5A4C' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.5vw',
                      cursor: userResponse.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isLoadingFeedback ? 'Getting Feedback...' : 'Get AI Feedback'}
                  </button>
                ) : (
                  <div>
                    {/* AI Feedback */}
                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: '#F0F7F4',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '0.9vw',
                        fontWeight: 500,
                        color: '#3D5A4C',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        📝 Mentor Feedback
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {aiFeedback}
                      </p>
                    </div>

                    {/* Suggested Response */}
                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: '#F5F5FF',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '0.9vw',
                        fontWeight: 500,
                        color: '#4B0082',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        💡 Example Compassion Response
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0
                      }}>
                        {currentScenario.compassionResponse}
                      </p>
                    </div>

                    <button
                      onClick={nextScenario}
                      style={{
                        width: '100%',
                        padding: '1vw',
                        fontSize: '1vw',
                        fontWeight: 500,
                        backgroundColor: '#3D5A4C',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5vw',
                        cursor: 'pointer'
                      }}
                    >
                      {currentScenarioIndex < filteredScenarios.length - 1 ? 'Next Scenario →' : 'Finish Practice'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Exercise Type: Reframe */}
            {activeExercise === 'reframe' && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '1vw',
                padding: '2vw',
                border: '1px solid #e8e8e8'
              }}>
                <h3 style={{
                  fontSize: '1.1vw',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  margin: 0,
                  marginBottom: '0.5vw'
                }}>
                  Reframe the Drama
                </h3>
                <p style={{
                  fontSize: '0.9vw',
                  color: '#666',
                  margin: 0,
                  marginBottom: '1.5vw'
                }}>
                  How could {currentScenario.personA} express themselves from the Compassion Triangle instead?
                </p>

                {/* Original Statement */}
                <div style={{
                  padding: '1.2vw',
                  backgroundColor: '#FFF8F0',
                  borderRadius: '0.8vw',
                  marginBottom: '1vw',
                  borderLeft: '4px solid #8B4513'
                }}>
                  <p style={{ fontSize: '0.8vw', color: '#8B4513', margin: 0, marginBottom: '0.3vw' }}>
                    Original ({currentScenario.correctRole})
                  </p>
                  <p style={{ fontSize: '0.95vw', color: '#333', margin: 0, fontStyle: 'italic' }}>
                    "{currentScenario.personB}"
                  </p>
                </div>

                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Rewrite this from the Compassion Triangle..."
                  disabled={showResponseFeedback}
                  style={{
                    width: '100%',
                    padding: '1vw',
                    fontSize: '1vw',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5vw',
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    marginBottom: '1vw'
                  }}
                  rows={4}
                />

                {!showResponseFeedback ? (
                  <button
                    onClick={getResponseFeedback}
                    disabled={!userResponse.trim() || isLoadingFeedback}
                    style={{
                      width: '100%',
                      padding: '1vw',
                      fontSize: '1vw',
                      fontWeight: 500,
                      backgroundColor: userResponse.trim() ? '#4B0082' : '#ccc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.5vw',
                      cursor: userResponse.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isLoadingFeedback ? 'Getting Feedback...' : 'Check My Reframe'}
                  </button>
                ) : (
                  <div>
                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: '#F0F7F4',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '0.9vw',
                        fontWeight: 500,
                        color: '#3D5A4C',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        📝 Feedback
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {aiFeedback}
                      </p>
                    </div>

                    <div style={{
                      padding: '1.5vw',
                      backgroundColor: '#F5F5FF',
                      borderRadius: '0.8vw',
                      marginBottom: '1.5vw'
                    }}>
                      <p style={{
                        fontSize: '0.9vw',
                        fontWeight: 500,
                        color: '#4B0082',
                        margin: 0,
                        marginBottom: '0.5vw'
                      }}>
                        💡 Example Reframe
                      </p>
                      <p style={{
                        fontSize: '0.95vw',
                        color: '#333',
                        lineHeight: 1.7,
                        margin: 0
                      }}>
                        {currentScenario.compassionResponse}
                      </p>
                    </div>

                    <button
                      onClick={nextScenario}
                      style={{
                        width: '100%',
                        padding: '1vw',
                        fontSize: '1vw',
                        fontWeight: 500,
                        backgroundColor: '#4B0082',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5vw',
                        cursor: 'pointer'
                      }}
                    >
                      {currentScenarioIndex < filteredScenarios.length - 1 ? 'Next Scenario →' : 'Finish Practice'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Panel - Quick Reference */}
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
          Quick Reference
        </h2>

        {/* Drama Triangle */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#FFF8F0',
          borderRadius: '0.8vw',
          marginBottom: '1vw'
        }}>
          <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#8B4513', margin: 0, marginBottom: '0.8vw' }}>
            🔺 Drama Triangle
          </h3>
          <div style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 0.5vw 0' }}>
              <strong>😢 Victim:</strong> "Poor me, I can't..."
            </p>
            <p style={{ margin: '0 0 0.5vw 0' }}>
              <strong>😠 Persecutor:</strong> "It's your fault..."
            </p>
            <p style={{ margin: 0 }}>
              <strong>🦸 Rescuer:</strong> "Let me fix this..."
            </p>
          </div>
        </div>

        {/* Compassion Triangle */}
        <div style={{
          padding: '1.2vw',
          backgroundColor: '#F0F7F4',
          borderRadius: '0.8vw',
          marginBottom: '1.5vw'
        }}>
          <h3 style={{ fontSize: '0.95vw', fontWeight: 500, color: '#3D5A4C', margin: 0, marginBottom: '0.8vw' }}>
            💚 Compassion Triangle
          </h3>
          <div style={{ fontSize: '0.8vw', color: '#666', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 0.5vw 0' }}>
              <strong>💚 Vulnerable:</strong> "I feel... I need..."
            </p>
            <p style={{ margin: '0 0 0.5vw 0' }}>
              <strong>💪 Assertive:</strong> "I need this to change..."
            </p>
            <p style={{ margin: 0 }}>
              <strong>🤗 Caring:</strong> "How can I support you?"
            </p>
          </div>
        </div>

        {/* Tips */}
        <h3 style={{
          fontSize: '0.95vw',
          fontWeight: 500,
          color: '#1a1a1a',
          marginBottom: '1vw'
        }}>
          Spotting Clues
        </h3>

        <div style={{
          fontSize: '0.8vw',
          color: '#666',
          lineHeight: 1.7
        }}>
          <p style={{ margin: '0 0 0.8vw 0' }}>
            <strong>Victim words:</strong> "always," "never," "can't," "poor me," "why me"
          </p>
          <p style={{ margin: '0 0 0.8vw 0' }}>
            <strong>Persecutor words:</strong> "you should," "you always," "it's your fault," "you never"
          </p>
          <p style={{ margin: 0 }}>
            <strong>Rescuer words:</strong> "let me," "I'll fix it," "don't worry," "you need me"
          </p>
        </div>

        {/* Links */}
        <div style={{ marginTop: '1.5vw' }}>
          <Link
            href="/mentor"
            style={{
              display: 'block',
              padding: '0.8vw 1vw',
              backgroundColor: '#4B0082',
              color: '#ffffff',
              borderRadius: '0.5vw',
              textDecoration: 'none',
              fontSize: '0.85vw',
              textAlign: 'center',
              marginBottom: '0.5vw'
            }}
          >
            📚 Ask the Mentor
          </Link>
          <Link
            href="/learn"
            style={{
              display: 'block',
              padding: '0.8vw 1vw',
              backgroundColor: '#f5f5f5',
              color: '#333',
              borderRadius: '0.5vw',
              textDecoration: 'none',
              fontSize: '0.85vw',
              textAlign: 'center'
            }}
          >
            📖 Review Lessons
          </Link>
        </div>
      </div>
    </div>
  )
}