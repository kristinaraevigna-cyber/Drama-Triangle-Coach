'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Lesson {
  id: string
  title: string
  duration: string
  content: string[]
  keyPoints: string[]
  reflection: string
}

interface Course {
  id: string
  title: string
  description: string
  duration: string
  color: string
  bgColor: string
  lessons: Lesson[]
}

const COURSES: Course[] = [
  {
    id: 'drama-triangle',
    title: 'The Drama Triangle',
    description: 'Understanding the three roles that keep us stuck in conflict',
    duration: '26 min',
    color: '#8B4513',
    bgColor: '#FFF8F0',
    lessons: [
      {
        id: 'dt-intro',
        title: 'Introduction to the Drama Triangle',
        duration: '5 min',
        content: [
          "The Drama Triangle was developed by Dr. Stephen Karpman in 1968. It's a social model that describes three habitual psychological roles that people often take in conflict situations: Victim, Persecutor, and Rescuer.",
          "These roles are not about who we really are, but about the positions we unconsciously adopt when we feel stressed, threatened, or triggered. Understanding these patterns is the first step to breaking free from them.",
          "The Drama Triangle is self-perpetuating. Once we enter it, we tend to move between all three positions, and we pull others into the drama with us. The key insight is that all three roles are dysfunctional - even the Rescuer.",
          "Dr. Karpman's brilliant observation was that these roles form a triangle because people don't stay in one position. A Victim can quickly become a Persecutor. A Rescuer can become a Victim. The drama continues in cycles."
        ],
        keyPoints: [
          'The Drama Triangle has three roles: Victim, Persecutor, and Rescuer',
          'All three roles are dysfunctional ways of relating',
          'People cycle between roles during conflicts',
          'Awareness is the first step to change'
        ],
        reflection: 'Think about a recent conflict. Can you identify which role you started in? Did you switch roles at any point?'
      },
      {
        id: 'dt-victim',
        title: 'The Victim Role',
        duration: '7 min',
        content: [
          "The Victim's position is 'Poor me!' They feel helpless, hopeless, and powerless. They believe they can't do anything to change their situation and that life happens TO them.",
          "Important: The Victim in the Drama Triangle is different from someone who has actually been victimized. Real victims exist. The Drama Triangle Victim is someone who has adopted victimhood as their primary way of relating to the world.",
          "The Victim's payoff is that they don't have to take responsibility. If everything is someone else's fault, they never have to change. They also get attention and sympathy from Rescuers.",
          "Common Victim phrases include: 'I can't...', 'It's not my fault...', 'Why does this always happen to me?', 'There's nothing I can do...', 'You don't understand how hard it is...'",
          "The Victim's underlying belief is often: 'I am not capable' or 'I don't deserve better.' These beliefs keep them stuck in the pattern."
        ],
        keyPoints: [
          "Victim's motto: 'Poor me!'",
          'Feels helpless and powerless',
          'Avoids taking responsibility',
          'Seeks Rescuers for validation',
          'Different from actual victimization'
        ],
        reflection: "When do you find yourself saying 'I can't' or feeling like things are being done TO you rather than being something you can influence?"
      },
      {
        id: 'dt-persecutor',
        title: 'The Persecutor Role',
        duration: '7 min',
        content: [
          "The Persecutor's position is 'It's all your fault!' They criticize, blame, and attack. They see themselves as superior and others as inferior or wrong.",
          "Persecutors often believe they're just being 'honest' or 'telling it like it is.' They may see themselves as strong, when really they're being aggressive rather than assertive.",
          "The Persecutor is often a former Victim who has found power through attacking others. Rather than feeling helpless, they've learned to dominate. But this isn't true strength - it's a defense mechanism.",
          "Common Persecutor phrases include: 'You always...', 'You never...', 'It's your fault...', 'You should have...', 'What's wrong with you?'",
          "The Persecutor's underlying belief is often: 'I have to control others to be safe' or 'Attack before being attacked.' They fear vulnerability."
        ],
        keyPoints: [
          "Persecutor's motto: 'It's all your fault!'",
          'Criticizes, blames, and attacks',
          'Often a former Victim seeking power',
          'Confuses aggression with strength',
          'Fears vulnerability and being controlled'
        ],
        reflection: 'When you feel angry or critical, what are you really feeling underneath? Fear? Hurt? What would happen if you expressed that instead?'
      },
      {
        id: 'dt-rescuer',
        title: 'The Rescuer Role',
        duration: '7 min',
        content: [
          "The Rescuer's position is 'Let me help you!' While this sounds positive, the Rescuer helps in ways that keep the Victim dependent. They need to be needed.",
          "The Rescuer's 'help' is often unsolicited. They jump in without being asked, take over problems that aren't theirs, and feel guilty if they don't help. This isn't genuine care - it's a way to feel valuable.",
          "Rescuers often neglect their own needs while focusing on others. They may feel exhausted and resentful, wondering why no one takes care of them. This is because they teach others that their needs don't matter.",
          "The Rescuer enables the Victim to stay helpless. By always swooping in, they send the message: 'You can't handle this yourself.' This keeps the Victim stuck.",
          "When Rescuers burn out or feel unappreciated, they often switch to Victim ('No one appreciates me!') or Persecutor ('After all I've done for you!')."
        ],
        keyPoints: [
          "Rescuer's motto: 'Let me help you!'",
          'Helps in ways that create dependency',
          'Needs to be needed to feel valuable',
          'Often neglects own needs',
          'Can flip to Victim or Persecutor when burned out'
        ],
        reflection: "Do you find yourself helping others even when they don't ask? What need does helping fulfill in you?"
      }
    ]
  },
  {
    id: 'compassion-triangle',
    title: 'The Compassion Triangle',
    description: 'Healthy alternatives to drama roles',
    duration: '26 min',
    color: '#3D5A4C',
    bgColor: '#F0F7F4',
    lessons: [
      {
        id: 'ct-intro',
        title: 'From Drama to Compassion',
        duration: '5 min',
        content: [
          "The Compassion Triangle offers healthy alternatives to the three Drama Triangle roles. Instead of Victim, Persecutor, and Rescuer, we can choose Vulnerable, Assertive, and Caring.",
          "The key difference is authenticity versus manipulation. Drama roles are about getting needs met indirectly. Compassion roles are about being honest and direct while respecting both yourself and others.",
          "Moving from Drama to Compassion isn't about being perfect. It's about awareness and choice. When you notice yourself in a Drama role, you can consciously shift to the Compassion alternative.",
          "Dr. Karpman developed the Compassion Triangle to show that there are healthy ways to be vulnerable, set boundaries, and help others. These aren't weaknesses - they're strengths."
        ],
        keyPoints: [
          'Compassion Triangle: Vulnerable, Assertive, Caring',
          'Based on authenticity rather than manipulation',
          'Requires awareness and conscious choice',
          'All three positions are strengths, not weaknesses'
        ],
        reflection: 'Which Drama role do you fall into most often? What would the Compassion alternative look like in that situation?'
      },
      {
        id: 'ct-vulnerable',
        title: 'The Vulnerable Position',
        duration: '7 min',
        content: [
          "Vulnerable is the healthy alternative to Victim. Instead of 'Poor me, I'm helpless,' Vulnerable says 'I'm struggling AND I'm capable of working through this.'",
          "Being Vulnerable means owning your feelings without giving away your power. You can say 'I'm hurt' without saying 'You hurt me and now you have to fix it.'",
          "Vulnerability requires courage. It means admitting when you're struggling, asking for support (not rescue), and being honest about your limitations while still taking responsibility.",
          "The Vulnerable position sounds like: 'I'm feeling overwhelmed and I could use some support.', 'I made a mistake and I'm working to fix it.', 'I don't know how to handle this, but I'm going to figure it out.'"
        ],
        keyPoints: [
          'Owns feelings without giving away power',
          'Admits struggles while maintaining capability',
          'Asks for support, not rescue',
          'Takes responsibility for own experience'
        ],
        reflection: 'What would it feel like to admit a struggle without making someone else responsible for fixing it?'
      },
      {
        id: 'ct-assertive',
        title: 'The Assertive Position',
        duration: '7 min',
        content: [
          "Assertive is the healthy alternative to Persecutor. Instead of attacking and blaming, Assertive sets clear boundaries while respecting others' dignity.",
          "Being Assertive means stating your needs directly without aggression. You can say 'I need...' or 'This isn't working for me' without making the other person wrong.",
          "Assertive uses 'I' statements rather than 'You' accusations. Instead of 'You never listen!' try 'I feel unheard when I'm interrupted.'",
          "The Assertive position sounds like: 'I need some quiet time right now.', 'That doesn't work for me. Here's what I can do.', 'I disagree, and here's my perspective.'"
        ],
        keyPoints: [
          'Sets boundaries without attacking',
          'States needs directly and clearly',
          'Uses "I" statements instead of "You" accusations',
          'Respects both self and others'
        ],
        reflection: "Think of something you've been resentful about. How could you express that need assertively instead?"
      },
      {
        id: 'ct-caring',
        title: 'The Caring Position',
        duration: '7 min',
        content: [
          "Caring is the healthy alternative to Rescuer. Instead of jumping in to fix and enable, Caring supports others while believing in their capability.",
          "Being Caring means offering support that empowers rather than creates dependency. You ask 'How can I support you?' rather than taking over.",
          "Caring respects others' autonomy. It trusts that people can handle their own problems, even when it's hard to watch them struggle. This is actually more loving than rescuing.",
          "The Caring position sounds like: 'That sounds really hard. How can I support you?', 'I believe you can figure this out. I'm here if you need me.', 'What would be most helpful right now?'"
        ],
        keyPoints: [
          'Supports without creating dependency',
          'Asks before helping',
          "Believes in others' capability",
          'Empowers rather than enables'
        ],
        reflection: 'When someone you care about is struggling, what would it look like to support them without rescuing them?'
      }
    ]
  },
  {
    id: 'role-switches',
    title: 'Role Switches',
    description: 'How we move between Drama Triangle positions',
    duration: '18 min',
    color: '#4B0082',
    bgColor: '#F5F5FF',
    lessons: [
      {
        id: 'rs-intro',
        title: 'Understanding Role Switches',
        duration: '6 min',
        content: [
          "One of the most important insights about the Drama Triangle is that people don't stay in one role. We constantly switch between Victim, Persecutor, and Rescuer - sometimes within minutes.",
          "These switches happen automatically, triggered by what others do or say. When a Rescuer feels unappreciated, they may switch to Victim. When a Victim gets frustrated, they may become a Persecutor.",
          "Understanding your typical switching patterns is key to breaking free from the Drama Triangle. Once you can predict your switches, you can interrupt them.",
          "The goal isn't to eliminate all drama from your life - that's impossible. The goal is to recognize when you're in the triangle and choose to step out into the Compassion Triangle instead."
        ],
        keyPoints: [
          'People constantly switch between all three roles',
          'Switches are triggered automatically',
          'Recognizing patterns helps interrupt them',
          'The goal is awareness and choice'
        ],
        reflection: 'What typically triggers you to switch from one role to another? Can you identify a recent example?'
      },
      {
        id: 'rs-common',
        title: 'Common Switch Patterns',
        duration: '6 min',
        content: [
          "Rescuer to Victim: 'After all I've done for you, and this is the thanks I get!' The Rescuer feels unappreciated and becomes the Victim of ingratitude.",
          "Rescuer to Persecutor: 'I've helped you so many times and you never change!' The frustrated Rescuer attacks the person they were trying to help.",
          "Victim to Persecutor: 'You made me feel this way!' The Victim finds power through blaming and attacking the perceived source of their suffering.",
          "Persecutor to Victim: 'I was just trying to help and now everyone's against me!' When confronted, the Persecutor claims victim status.",
          "These patterns repeat in predictable cycles. Learning to recognize your personal patterns is the first step to changing them."
        ],
        keyPoints: [
          'Rescuer → Victim: Feeling unappreciated',
          'Rescuer → Persecutor: Frustration with those they help',
          'Victim → Persecutor: Finding power through blame',
          'Persecutor → Victim: Claiming victimhood when confronted'
        ],
        reflection: 'Which switch pattern do you recognize most in yourself? In your close relationships?'
      },
      {
        id: 'rs-breaking',
        title: 'Breaking the Cycle',
        duration: '6 min',
        content: [
          "The first step to breaking the cycle is simply noticing when you're in the Drama Triangle. This awareness itself is powerful - you can't change what you don't see.",
          "When you notice yourself in a Drama role, pause. Take a breath. Ask yourself: 'What am I really feeling right now? What do I really need?'",
          "Then choose the Compassion Triangle alternative. If you're in Victim, shift to Vulnerable. If you're in Persecutor, shift to Assertive. If you're in Rescuer, shift to Caring.",
          "Remember: You can only control your own behavior. You can't force others out of the Drama Triangle, but when you step out, you change the dynamic. Often, others will follow."
        ],
        keyPoints: [
          'Notice when you are in the Drama Triangle',
          'Pause and ask what you really feel and need',
          'Choose the Compassion Triangle alternative',
          'You can only control your own behavior'
        ],
        reflection: 'What would help you pause and notice when you are entering the Drama Triangle? What cues could you watch for?'
      }
    ]
  },
  {
    id: 'scales-intimacy',
    title: 'Scales of Intimacy',
    description: 'Understanding closeness and distance in relationships',
    duration: '24 min',
    color: '#2E8B57',
    bgColor: '#F0FFF4',
    lessons: [
      {
        id: 'si-intro',
        title: 'Introduction to Intimacy Scales',
        duration: '6 min',
        content: [
          "Dr. Karpman developed the Scales of Intimacy to help us understand the different levels of closeness in our relationships and how we move between them.",
          "Intimacy isn't just about romantic relationships - it applies to all our connections: family, friends, colleagues, and acquaintances.",
          "The scales help us understand why some conversations feel connecting while others feel distant, and why we sometimes pull away from closeness or push for more connection.",
          "Understanding these scales helps us make conscious choices about the level of intimacy that's appropriate for each relationship and situation."
        ],
        keyPoints: [
          'Intimacy scales apply to all relationships',
          'Different levels serve different purposes',
          'We move between levels constantly',
          'Awareness enables conscious choice'
        ],
        reflection: 'Think about your closest relationship. How does the level of intimacy fluctuate throughout a typical day or week?'
      },
      {
        id: 'si-levels',
        title: 'The Five Levels',
        duration: '6 min',
        content: [
          "Level 1 - Ritual: 'Hi, how are you?' 'Fine, thanks.' These are the social niceties that keep society functioning smoothly. They're not deep but they serve a purpose.",
          "Level 2 - Pastimes: Small talk about weather, sports, news. These conversations are safe and help us connect without vulnerability.",
          "Level 3 - Activities: Working together, sharing hobbies. Connection through doing rather than deep sharing.",
          "Level 4 - Games: Drama Triangle interactions. These feel intimate because they're intense, but they're actually a way of avoiding true intimacy.",
          "Level 5 - Intimacy: Authentic sharing of feelings, thoughts, and experiences. Vulnerability without manipulation. This is the deepest level of connection."
        ],
        keyPoints: [
          'Level 1: Rituals and greetings',
          'Level 2: Pastimes and small talk',
          'Level 3: Activities and shared doing',
          'Level 4: Games (Drama Triangle)',
          'Level 5: True intimacy and vulnerability'
        ],
        reflection: 'What level do you spend most of your time in? Which level feels most comfortable? Most uncomfortable?'
      },
      {
        id: 'si-games',
        title: 'Games vs True Intimacy',
        duration: '6 min',
        content: [
          "One of Dr. Karpman's key insights is that Drama Triangle interactions (Games) often masquerade as intimacy. They're intense and emotional, but they're not truly connecting.",
          "Games are predictable patterns that always end the same way - with bad feelings. True intimacy is unpredictable because it involves authentic sharing and genuine response.",
          "We often choose Games over Intimacy because they feel safer. In a Game, we know our role. In true intimacy, we're vulnerable without a script.",
          "The path from Games to Intimacy requires courage - the willingness to be truly seen without the protection of a Drama role."
        ],
        keyPoints: [
          'Games feel intense but avoid true connection',
          'Games are predictable; intimacy is not',
          'Games feel safer because we know our role',
          'Moving to intimacy requires courage'
        ],
        reflection: 'Can you identify a relationship where you often engage in Games instead of true intimacy? What would shifting to intimacy require?'
      },
      {
        id: 'si-choosing',
        title: 'Choosing Your Level',
        duration: '6 min',
        content: [
          "Not every relationship needs to be at Level 5. It's appropriate to have different levels of intimacy with different people.",
          "The key is conscious choice. Are you at Level 2 with your partner because it's appropriate, or because you're avoiding vulnerability?",
          "Building intimacy takes time and trust. You don't jump from Level 1 to Level 5. You gradually deepen connection as safety is established.",
          "Respect others' pace. Just because you're ready for more intimacy doesn't mean they are. True intimacy requires mutual willingness."
        ],
        keyPoints: [
          'Different levels are appropriate for different relationships',
          'The key is conscious choice, not avoidance',
          'Intimacy builds gradually with trust',
          'Respect others pace and boundaries'
        ],
        reflection: 'In which relationship would you like to deepen intimacy? What small step could you take to move in that direction?'
      }
    ]
  }
]

export default function LearnPage() {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setSelectedLesson(null)
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null)
    } else if (selectedCourse) {
      setSelectedCourse(null)
    }
  }

  const markComplete = () => {
    if (selectedLesson && !completedLessons.includes(selectedLesson.id)) {
      setCompletedLessons([...completedLessons, selectedLesson.id])
    }
    
    if (selectedCourse && selectedLesson) {
      const currentIndex = selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id)
      if (currentIndex < selectedCourse.lessons.length - 1) {
        setSelectedLesson(selectedCourse.lessons[currentIndex + 1])
      } else {
        setSelectedLesson(null)
      }
    }
  }

  const getCourseProgress = (course: Course) => {
    const completed = course.lessons.filter(l => completedLessons.includes(l.id)).length
    return Math.round((completed / course.lessons.length) * 100)
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

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          margin: '0 2vw 2vw 2vw'
        }} />

        <nav style={{ flex: 1, padding: '0 1vw' }}>
          {[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Compassion Coach', href: '/coach' },
            { name: 'Mentor Coach', href: '/mentor' },
            { name: 'Learn', href: '/learn', active: true },
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
                fontWeight: item.active ? 500 : 400,
                cursor: 'pointer'
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '2.5vw',
        overflowY: 'auto'
      }}>
        {/* Course List View */}
        {!selectedCourse && (
          <>
            <div style={{ marginBottom: '2vw' }}>
              <h1 style={{
                fontSize: '2vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: 0
              }}>
                Learn
              </h1>
              <p style={{ fontSize: '1vw', color: '#666', margin: '0.5vw 0 0 0' }}>
                Master the Drama Triangle and Compassion Triangle frameworks
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5vw'
            }}>
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  style={{
                    backgroundColor: course.bgColor,
                    borderRadius: '1vw',
                    padding: '2vw',
                    cursor: 'pointer',
                    border: '1px solid #e8e8e8',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1vw'
                  }}>
                    <div style={{
                      width: '3vw',
                      height: '3vw',
                      backgroundColor: course.color,
                      borderRadius: '0.5vw',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#fff', fontSize: '1.2vw' }}>📚</span>
                    </div>
                    <span style={{
                      padding: '0.3vw 0.8vw',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '1vw',
                      fontSize: '0.75vw',
                      color: '#666'
                    }}>
                      {course.lessons.length} lessons • {course.duration}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.2vw',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    margin: '0 0 0.5vw 0',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {course.title}
                  </h3>

                  <p style={{
                    fontSize: '0.9vw',
                    color: '#666',
                    margin: '0 0 1.5vw 0',
                    lineHeight: 1.5
                  }}>
                    {course.description}
                  </p>

                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.3vw'
                    }}>
                      <span style={{ fontSize: '0.8vw', color: '#666' }}>Progress</span>
                      <span style={{ fontSize: '0.8vw', color: '#666' }}>{getCourseProgress(course)}%</span>
                    </div>
                    <div style={{
                      height: '0.4vw',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: '0.2vw',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${getCourseProgress(course)}%`,
                        backgroundColor: course.color,
                        borderRadius: '0.2vw'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lesson List View */}
        {selectedCourse && !selectedLesson && (
          <>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5vw',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '0.95vw',
                cursor: 'pointer',
                marginBottom: '2vw',
                padding: 0
              }}
            >
              ← Back to Courses
            </button>

            <div style={{
              backgroundColor: selectedCourse.bgColor,
              borderRadius: '1vw',
              padding: '2vw',
              marginBottom: '2vw'
            }}>
              <h1 style={{
                fontSize: '1.8vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: 0
              }}>
                {selectedCourse.title}
              </h1>
              <p style={{ fontSize: '1vw', color: '#666', margin: '0.5vw 0 0 0' }}>
                {selectedCourse.description}
              </p>
              <div style={{ marginTop: '1vw' }}>
                <div style={{
                  height: '0.5vw',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '0.25vw',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${getCourseProgress(selectedCourse)}%`,
                    backgroundColor: selectedCourse.color
                  }} />
                </div>
                <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.3vw 0 0 0' }}>
                  {getCourseProgress(selectedCourse)}% complete
                </p>
              </div>
            </div>

            <h2 style={{
              fontSize: '1.3vw',
              fontWeight: 500,
              color: '#1a1a1a',
              marginBottom: '1vw'
            }}>
              Lessons
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
              {selectedCourse.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.8vw',
                    padding: '1.5vw',
                    cursor: 'pointer',
                    border: '1px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1vw'
                  }}
                >
                  <div style={{
                    width: '2.5vw',
                    height: '2.5vw',
                    borderRadius: '50%',
                    backgroundColor: completedLessons.includes(lesson.id) ? selectedCourse.color : '#e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {completedLessons.includes(lesson.id) ? (
                      <span style={{ color: '#fff', fontSize: '1vw' }}>✓</span>
                    ) : (
                      <span style={{ color: '#666', fontSize: '0.9vw' }}>{index + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.05vw',
                      fontWeight: 500,
                      color: '#1a1a1a',
                      margin: 0
                    }}>
                      {lesson.title}
                    </h3>
                    <p style={{ fontSize: '0.85vw', color: '#666', margin: '0.2vw 0 0 0' }}>
                      {lesson.duration}
                    </p>
                  </div>
                  <span style={{ color: '#999', fontSize: '1.2vw' }}>→</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lesson Content View */}
        {selectedCourse && selectedLesson && (
          <>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5vw',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '0.95vw',
                cursor: 'pointer',
                marginBottom: '2vw',
                padding: 0
              }}
            >
              ← Back to {selectedCourse.title}
            </button>

            <div style={{ maxWidth: '50vw' }}>
              <span style={{
                padding: '0.3vw 0.8vw',
                backgroundColor: selectedCourse.color,
                color: '#fff',
                borderRadius: '0.3vw',
                fontSize: '0.8vw'
              }}>
                {selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id) + 1} of {selectedCourse.lessons.length}
              </span>

              <h1 style={{
                fontSize: '2vw',
                fontWeight: 500,
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                margin: '1vw 0 2vw 0'
              }}>
                {selectedLesson.title}
              </h1>

              {selectedLesson.content.map((paragraph, i) => (
                <p key={i} style={{
                  fontSize: '1.05vw',
                  color: '#333',
                  lineHeight: 1.8,
                  marginBottom: '1.5vw'
                }}>
                  {paragraph}
                </p>
              ))}

              <div style={{
                backgroundColor: '#F0F7F4',
                borderRadius: '1vw',
                padding: '2vw',
                marginBottom: '2vw'
              }}>
                <h3 style={{
                  fontSize: '1.1vw',
                  fontWeight: 500,
                  color: '#3D5A4C',
                  marginBottom: '1vw'
                }}>
                  Key Points
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5vw' }}>
                  {selectedLesson.keyPoints.map((point, i) => (
                    <li key={i} style={{
                      fontSize: '0.95vw',
                      color: '#333',
                      marginBottom: '0.5vw',
                      lineHeight: 1.6
                    }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                backgroundColor: '#F5F5FF',
                borderRadius: '1vw',
                padding: '2vw',
                marginBottom: '2vw'
              }}>
                <h3 style={{
                  fontSize: '1.1vw',
                  fontWeight: 500,
                  color: '#4B0082',
                  marginBottom: '0.5vw'
                }}>
                  Reflection Question
                </h3>
                <p style={{
                  fontSize: '1vw',
                  color: '#333',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {selectedLesson.reflection}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '2vw',
                borderTop: '1px solid #e8e8e8'
              }}>
                <button
                  onClick={() => {
                    const currentIndex = selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id)
                    if (currentIndex > 0) {
                      setSelectedLesson(selectedCourse.lessons[currentIndex - 1])
                    }
                  }}
                  disabled={selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id) === 0}
                  style={{
                    padding: '0.8vw 1.5vw',
                    backgroundColor: '#ffffff',
                    color: selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id) === 0 ? '#999' : '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.5vw',
                    cursor: selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id) === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.95vw'
                  }}
                >
                  ← Previous
                </button>

                <button
                  onClick={markComplete}
                  style={{
                    padding: '0.8vw 2vw',
                    backgroundColor: selectedCourse.color,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.5vw',
                    cursor: 'pointer',
                    fontSize: '0.95vw',
                    fontWeight: 500
                  }}
                >
                  {selectedCourse.lessons.findIndex(l => l.id === selectedLesson.id) < selectedCourse.lessons.length - 1
                    ? 'Complete & Continue →'
                    : 'Complete Lesson ✓'
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Panel */}
      <div style={{
        width: '18vw',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e8e8e8',
        padding: '2vw'
      }}>
        <h2 style={{
          fontSize: '1.1vw',
          fontWeight: 500,
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          marginBottom: '1.5vw'
        }}>
          {selectedLesson ? 'Apply This Lesson' : 'Quick Links'}
        </h2>

        <div
          onClick={() => router.push('/coach')}
          style={{
            padding: '1vw',
            backgroundColor: '#F0F7F4',
            borderRadius: '0.5vw',
            marginBottom: '1vw',
            cursor: 'pointer'
          }}
        >
          <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#3D5A4C', margin: 0 }}>
            🎯 Practice with Coach
          </p>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>
            Apply concepts to your situation
          </p>
        </div>

        <div
          onClick={() => router.push('/practice')}
          style={{
            padding: '1vw',
            backgroundColor: '#FFF8F0',
            borderRadius: '0.5vw',
            marginBottom: '1vw',
            cursor: 'pointer'
          }}
        >
          <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#8B4513', margin: 0 }}>
            🎮 Practice Scenarios
          </p>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>
            Test your understanding
          </p>
        </div>

        <div
          onClick={() => router.push('/journal')}
          style={{
            padding: '1vw',
            backgroundColor: '#f9f9f9',
            borderRadius: '0.5vw',
            cursor: 'pointer'
          }}
        >
          <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#333', margin: 0 }}>
            📝 Journal
          </p>
          <p style={{ fontSize: '0.8vw', color: '#666', margin: '0.3vw 0 0 0' }}>
            Record your insights
          </p>
        </div>

        {!selectedCourse && (
          <div style={{
            marginTop: '2vw',
            padding: '1.5vw',
            backgroundColor: '#F0F7F4',
            borderRadius: '0.8vw'
          }}>
            <p style={{ fontSize: '0.9vw', fontWeight: 500, color: '#3D5A4C', margin: 0, marginBottom: '0.5vw' }}>
              💡 Recommended Path
            </p>
            <p style={{ fontSize: '0.85vw', color: '#666', margin: 0, lineHeight: 1.5 }}>
              Start with Drama Triangle, then learn the Compassion Triangle alternatives.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}