"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import AttendanceButton from "@/components/attendance-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { FileText, Video, Award, Download, CheckCircle, Calendar, BookOpen, Lock, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Content {
  id: string
  title: string
  type: "PDF" | "Video"
  url?: string
  fileName?: string
}

interface MCQ {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  isAIGenerated?: boolean
}

interface Chapter {
  id: string
  name: string
  content: Content[]
  mcqs: MCQ[]
  department: string
}

interface TestResult {
  score: number
  total: number
  passed: boolean
  date: string
}

export default function TraineeDashboard() {
  const [assignedDepartment, setAssignedDepartment] = useState("")
  const [traineeUsername, setTraineeUsername] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [progress, setProgress] = useState<{ [chapterId: string]: any }>({})
  const [activeTab, setActiveTab] = useState("attendance")
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: number }>({})
  const [showTest, setShowTest] = useState(false)
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false)

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Meeting response states
  const [meetingResponses, setMeetingResponses] = useState<{ [key: string]: boolean }>({})

  // Attendance code states
  const [attendanceCode, setAttendanceCode] = useState("")
  const [codeSubmissionMessage, setCodeSubmissionMessage] = useState("")

  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem("userRole") !== "trainee") {
      router.push("/")
      return
    }

    // Get assigned department and trainee info
    const dept = localStorage.getItem("traineeDepartment") || ""
    const username = localStorage.getItem("traineeUsername") || ""
    setAssignedDepartment(dept)
    setTraineeUsername(username)

    // Load data from database
    loadTraineeData(dept, username)
  }, [router])

  const loadTraineeData = async (department: string, username: string) => {
    try {
      // Load chapters for department
      const chaptersResponse = await fetch(`/api/chapters?department=${encodeURIComponent(department)}`)
      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json()
        setChapters(chaptersData)
      }

      // Load progress
      const progressResponse = await fetch(
        `/api/progress?traineeId=${username}&department=${encodeURIComponent(department)}`,
      )
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setProgress(progressData.progress || {})
      }

      // Load notifications
      const notificationsResponse = await fetch(`/api/notifications?department=${encodeURIComponent(department)}`)
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData)

        // Count unread notifications
        const unread = notificationsData.filter((notif: any) => !notif.read).length
        setUnreadCount(unread)
      }

      // Check attendance (this can remain localStorage for now as it's device-specific)
      const attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords") || "{}")
      const today = new Date().toDateString()
      const todayAttendance = attendanceRecords[today]
      if (todayAttendance && todayAttendance.some((record: any) => record.department === department)) {
        setHasMarkedAttendance(true)
      }
    } catch (error) {
      console.error("Error loading trainee data:", error)
    }
  }

  const saveProgress = async (updatedProgress: any) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traineeId: traineeUsername,
          department: assignedDepartment,
          progress: updatedProgress,
        }),
      })

      if (response.ok) {
        setProgress(updatedProgress)
      }
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  const toggleContentCompletion = (chapterId: string, contentId: string) => {
    const chapterProgress = progress[chapterId] || { completedContent: [], testCompleted: false }
    const completedContent = chapterProgress.completedContent || []

    const updatedCompletedContent = completedContent.includes(contentId)
      ? completedContent.filter((id: string) => id !== contentId)
      : [...completedContent, contentId]

    const updatedProgress = {
      ...progress,
      [chapterId]: {
        ...chapterProgress,
        completedContent: updatedCompletedContent,
      },
    }

    saveProgress(updatedProgress)
  }

  const submitChapterTest = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (!chapter) return

    let correct = 0
    chapter.mcqs.forEach((mcq) => {
      if (currentAnswers[mcq.id] === mcq.correctAnswer) {
        correct++
      }
    })

    const score = correct
    const total = chapter.mcqs.length
    const passed = score / total >= 0.7 // 70% passing grade

    const chapterProgress = progress[chapterId] || { completedContent: [], testCompleted: false }
    const updatedProgress = {
      ...progress,
      [chapterId]: {
        ...chapterProgress,
        testCompleted: passed,
        testScore: score,
        testTotal: total,
        testDate: new Date().toLocaleDateString(),
      },
    }

    saveProgress(updatedProgress)
    setShowTest(false)
    setCurrentAnswers({})

    alert(`Chapter test completed! Score: ${score}/${total} (${Math.round((score / total) * 100)}%)`)
  }

  const isChapterUnlocked = (chapterIndex: number) => {
    if (chapterIndex === 0) return true // First chapter is always unlocked

    const previousChapter = chapters[chapterIndex - 1]
    const previousProgress = progress[previousChapter.id]

    if (!previousProgress) return false

    const allContentCompleted =
      previousProgress.completedContent?.length === previousChapter.content.length && previousChapter.content.length > 0
    const testCompleted = previousProgress.testCompleted || previousChapter.mcqs.length === 0

    return allContentCompleted && testCompleted
  }

  const getChapterProgress = (chapter: Chapter) => {
    const chapterProgress = progress[chapter.id] || { completedContent: [], testCompleted: false }
    const completedContent = chapterProgress.completedContent?.length || 0
    const totalItems = chapter.content.length + (chapter.mcqs.length > 0 ? 1 : 0)
    const testCompleted = chapterProgress.testCompleted ? 1 : 0

    return {
      completed: completedContent + testCompleted,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round(((completedContent + testCompleted) / totalItems) * 100) : 0,
    }
  }

  const getOverallProgress = () => {
    let totalCompleted = 0
    let totalItems = 0

    chapters.forEach((chapter) => {
      const chapterProg = getChapterProgress(chapter)
      totalCompleted += chapterProg.completed
      totalItems += chapterProg.total
    })

    return {
      completed: totalCompleted,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
    }
  }

  const canGetCertificate = () => {
    const overallProgress = getOverallProgress()
    return overallProgress.percentage === 100 && chapters.length > 0
  }

  const downloadCertificate = () => {
    const certificateContent = `
      CERTIFICATE OF COMPLETION
      
      This is to certify that
      ${localStorage.getItem("traineeName") || "TRAINEE"}
      
      has successfully completed the training program for
      ${assignedDepartment}
      
      Date: ${new Date().toLocaleDateString()}
      Username: ${traineeUsername}
      
      MedTrain System
      Hospital Learning Management System
    `

    const blob = new Blob([certificateContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Certificate_${assignedDepartment.replace(" ", "_")}_${traineeUsername}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif,
    )
    setNotifications(updatedNotifications)

    // Update in localStorage
    const allNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const updatedAllNotifications = allNotifications.map((notif: any) =>
      notif.id === notificationId ? { ...notif, read: true } : notif,
    )
    localStorage.setItem("notifications", JSON.stringify(updatedAllNotifications))

    // Update unread count
    const unread = updatedNotifications.filter((notif) => !notif.read).length
    setUnreadCount(unread)
  }

  const respondToMeeting = (notificationId: string, response: boolean) => {
    const updatedResponses = {
      ...meetingResponses,
      [notificationId]: response,
    }
    setMeetingResponses(updatedResponses)

    // Save to localStorage
    const allResponses = JSON.parse(localStorage.getItem("meetingResponses") || "{}")
    allResponses[`${assignedDepartment}_${traineeUsername}`] = updatedResponses
    localStorage.setItem("meetingResponses", JSON.stringify(allResponses))

    // Update the meeting responses in meetings data
    const savedMeetings = JSON.parse(localStorage.getItem("meetings") || "[]")
    const updatedMeetings = savedMeetings.map((meeting: any) => {
      if (meeting.id === notificationId) {
        return {
          ...meeting,
          responses: {
            ...meeting.responses,
            [traineeUsername]: response,
          },
        }
      }
      return meeting
    })
    localStorage.setItem("meetings", JSON.stringify(updatedMeetings))

    alert(`Response recorded: ${response ? "Yes, I will attend" : "No, I cannot attend"}`)
  }

  const submitAttendanceCode = () => {
    if (!attendanceCode.trim()) {
      setCodeSubmissionMessage("Please enter an attendance code")
      return
    }

    // Check if code exists in any meeting
    const savedMeetings = JSON.parse(localStorage.getItem("meetings") || "[]")
    const meeting = savedMeetings.find(
      (m: any) => m.attendanceCode === attendanceCode.trim() && m.department === assignedDepartment,
    )

    if (!meeting) {
      setCodeSubmissionMessage("Invalid attendance code")
      return
    }

    // Check if code is still valid (within 24 hours)
    const codeGeneratedAt = new Date(meeting.codeGeneratedAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - codeGeneratedAt.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      setCodeSubmissionMessage("Attendance code has expired")
      return
    }

    // Record attendance
    const attendanceRecord = {
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      traineeUsername,
      traineeName: localStorage.getItem("traineeName") || traineeUsername,
      department: assignedDepartment,
      attendanceCode: attendanceCode.trim(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    }

    const savedCodeAttendance = JSON.parse(localStorage.getItem("codeAttendance") || "[]")

    // Check if already marked attendance for this meeting
    const alreadyMarked = savedCodeAttendance.some(
      (record: any) => record.meetingId === meeting.id && record.traineeUsername === traineeUsername,
    )

    if (alreadyMarked) {
      setCodeSubmissionMessage("You have already marked attendance for this meeting")
      return
    }

    savedCodeAttendance.push(attendanceRecord)
    localStorage.setItem("codeAttendance", JSON.stringify(savedCodeAttendance))

    setCodeSubmissionMessage("Attendance marked successfully!")
    setAttendanceCode("")

    setTimeout(() => {
      setCodeSubmissionMessage("")
    }, 3000)
  }

  const overallProgress = getOverallProgress()
  const selectedChapterData = chapters.find((c) => c.id === selectedChapter)

  return (
    <Layout userRole="trainee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trainee Dashboard</h1>
          <p className="text-gray-600">
            Welcome @{traineeUsername} - Assigned to: {assignedDepartment}
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>Your learning journey in {assignedDepartment}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>
                  {overallProgress.completed}/{overallProgress.total} ({overallProgress.percentage}%)
                </span>
              </div>
              <Progress value={overallProgress.percentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{chapters.length}</div>
                <div className="text-sm text-gray-600">Total Chapters</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{overallProgress.completed}</div>
                <div className="text-sm text-gray-600">Completed Items</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{overallProgress.percentage}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${hasMarkedAttendance ? "bg-green-50" : "bg-orange-50"}`}>
                <div className={`text-2xl font-bold ${hasMarkedAttendance ? "text-green-600" : "text-orange-600"}`}>
                  {hasMarkedAttendance ? "✓" : "!"}
                </div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "attendance" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "chapters" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Training Chapters
          </button>
          <button
            onClick={() => setActiveTab("certificate")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "certificate" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Certificate
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === "notifications" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance</CardTitle>
              <CardDescription>Mark your attendance for today's training session</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex justify-center">
                <Calendar className="h-16 w-16 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Today's Date</h3>
                <p className="text-gray-600">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <AttendanceButton
                department={assignedDepartment}
                hasMarkedAttendance={hasMarkedAttendance}
                onAttendanceMarked={() => setHasMarkedAttendance(true)}
              />

              {hasMarkedAttendance && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Attendance marked successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your attendance has been recorded with device fingerprint for security.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Training Chapters Tab */}
        {activeTab === "chapters" && (
          <div className="space-y-6">
            {chapters.length > 0 ? (
              chapters.map((chapter, index) => {
                const isUnlocked = isChapterUnlocked(index)
                const chapterProgress = getChapterProgress(chapter)
                const chapterProgressData = progress[chapter.id] || { completedContent: [], testCompleted: false }

                return (
                  <Card key={chapter.id} className={`${!isUnlocked ? "opacity-60" : ""}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isUnlocked ? "bg-blue-100" : "bg-gray-100"}`}>
                            {isUnlocked ? (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Chapter {index + 1}: {chapter.name}
                            </CardTitle>
                            <CardDescription>
                              {chapter.content.length} content items, {chapter.mcqs.length} MCQs
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {chapterProgress.completed}/{chapterProgress.total} ({chapterProgress.percentage}%)
                          </div>
                          <Progress value={chapterProgress.percentage} className="w-24 h-2 mt-1" />
                        </div>
                      </div>
                    </CardHeader>

                    {isUnlocked && (
                      <CardContent className="space-y-4">
                        {/* Chapter Content */}
                        {chapter.content.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Training Materials</h4>
                            <div className="space-y-2">
                              {chapter.content.map((content) => (
                                <div
                                  key={content.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                                    chapterProgressData.completedContent?.includes(content.id)
                                      ? "bg-green-50 border-green-200"
                                      : "bg-white border-gray-200 hover:border-blue-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={chapterProgressData.completedContent?.includes(content.id) || false}
                                    onChange={() => toggleContentCompletion(chapter.id, content.id)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                  />
                                  {content.type === "PDF" ? (
                                    <FileText className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <Video className="h-5 w-5 text-blue-500" />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-medium">{content.title}</div>
                                    <div className="text-sm text-gray-500">{content.type} Document</div>
                                    {content.fileName && (
                                      <div className="text-xs text-gray-400">{content.fileName}</div>
                                    )}
                                    {content.url && (
                                      <a 
                                        href={content.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline"
                                      >
                                        View {content.type}
                                      </a>
                                    )}
                                  </div>
                                  {chapterProgressData.completedContent?.includes(content.id) && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chapter Test */}
                        {chapter.mcqs.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Chapter Assessment</h4>
                            {!showTest || selectedChapter !== chapter.id ? (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {chapterProgressData.testCompleted ? "Test Completed" : "Chapter Test"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {chapter.mcqs.length} questions • 70% required to pass
                                    </p>
                                    {chapterProgressData.testCompleted && (
                                      <p className="text-sm text-green-600 mt-1">
                                        Score: {chapterProgressData.testScore}/{chapterProgressData.testTotal} (
                                        {Math.round(
                                          (chapterProgressData.testScore / chapterProgressData.testTotal) * 100,
                                        )}
                                        %) • {chapterProgressData.testDate}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => {
                                      setSelectedChapter(chapter.id)
                                      setShowTest(true)
                                    }}
                                    disabled={
                                      chapterProgressData.completedContent?.length !== chapter.content.length &&
                                      chapter.content.length > 0
                                    }
                                  >
                                    {chapterProgressData.testCompleted ? "Retake Test" : "Start Test"}
                                  </Button>
                                </div>
                                {chapterProgressData.completedContent?.length !== chapter.content.length &&
                                  chapter.content.length > 0 && (
                                    <p className="text-sm text-red-500 mt-2">
                                      Complete all training materials before taking the test
                                    </p>
                                  )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold">Chapter {index + 1} Assessment</h4>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setShowTest(false)
                                      setSelectedChapter(null)
                                      setCurrentAnswers({})
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>

                                {chapter.mcqs.map((mcq, mcqIndex) => (
                                  <div key={mcq.id} className="p-4 border rounded-lg">
                                    <h5 className="font-medium mb-3">
                                      Question {mcqIndex + 1}: {mcq.question}
                                    </h5>
                                    <RadioGroup
                                      value={currentAnswers[mcq.id]?.toString() || ""}
                                      onValueChange={(value) =>
                                        setCurrentAnswers((prev) => ({
                                          ...prev,
                                          [mcq.id]: Number.parseInt(value),
                                        }))
                                      }
                                    >
                                      {mcq.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-2">
                                          <RadioGroupItem value={optIndex.toString()} id={`${mcq.id}-${optIndex}`} />
                                          <Label htmlFor={`${mcq.id}-${optIndex}`}>
                                            {String.fromCharCode(65 + optIndex)}. {option}
                                          </Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </div>
                                ))}

                                <Button
                                  onClick={() => submitChapterTest(chapter.id)}
                                  className="w-full"
                                  disabled={Object.keys(currentAnswers).length !== chapter.mcqs.length}
                                >
                                  Submit Chapter Test
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}

                    {!isUnlocked && (
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="font-medium">Chapter Locked</p>
                          <p className="text-sm">Complete the previous chapter to unlock this one</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No training chapters available for {assignedDepartment}</p>
                  <p className="text-sm">Please contact your trainer</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === "certificate" && (
          <Card>
            <CardHeader>
              <CardTitle>Certificate of Completion</CardTitle>
              <CardDescription>Download your certificate after completing all requirements</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {canGetCertificate() ? (
                <>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-green-200">
                    <Award className="h-16 w-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
                    <p className="text-green-700">
                      You have successfully completed all training requirements for {assignedDepartment}
                    </p>
                  </div>

                  <Button onClick={downloadCertificate} size="lg" className="w-full">
                    <Download className="h-5 w-5 mr-2" />
                    Download Certificate of Completion
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-600 mb-4">Certificate Requirements</h3>

                    <div className="space-y-3 text-left max-w-md mx-auto">
                      <div
                        className={`flex items-center gap-3 ${
                          overallProgress.percentage === 100 ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <CheckCircle
                          className={`h-5 w-5 ${
                            overallProgress.percentage === 100 ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <span>
                          Complete all training chapters ({overallProgress.completed}/{overallProgress.total})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    Complete all chapters and their assessments to unlock your certificate
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <>
            {/* Attendance Code Section */}
            <Card>
              <CardHeader>
                <CardTitle>Meeting Attendance Code</CardTitle>
                <CardDescription>
                  Enter the 5-digit code provided by your trainer for meeting attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 5-digit code"
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value)}
                    maxLength={5}
                    className="font-mono text-center text-lg"
                  />
                  <Button onClick={submitAttendanceCode}>Submit Code</Button>
                </div>
                {codeSubmissionMessage && (
                  <div
                    className={`text-sm p-2 rounded ${
                      codeSubmissionMessage.includes("successfully")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {codeSubmissionMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications & Updates</CardTitle>
                <CardDescription>Messages and announcements from admin and trainers</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                          }`}
                          onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && (
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                              )}
                              {notification.requireResponse && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                  Response Required
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">{notification.date}</div>
                              <div className="text-xs text-gray-400">
                                From: {notification.sender} ({notification.senderRole})
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3">{notification.message}</p>

                          {notification.requireResponse && notification.meetingDate && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Meeting Date: {notification.meetingDate}</span>
                                {meetingResponses[notification.id] !== undefined && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      meetingResponses[notification.id]
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {meetingResponses[notification.id] ? "Will Attend" : "Cannot Attend"}
                                  </span>
                                )}
                              </div>

                              {meetingResponses[notification.id] === undefined ? (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => respondToMeeting(notification.id, true)}
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Yes, I will attend
                                  </Button>
                                  <Button
                                    onClick={() => respondToMeeting(notification.id, false)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    No, I cannot attend
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => respondToMeeting(notification.id, !meetingResponses[notification.id])}
                                  variant="outline"
                                  size="sm"
                                >
                                  Change Response
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications yet</p>
                    <p className="text-sm">You'll see updates and announcements here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  )
}
