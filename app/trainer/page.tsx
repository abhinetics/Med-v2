"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Upload,
  Plus,
  FileText,
  Video,
  Trash2,
  Sparkles,
  Edit3,
  BookOpen,
  Bell,
  CheckCircle,
  Download,
} from "lucide-react"

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

// AI-generated sample MCQs for different departments
const AI_MCQ_TEMPLATES = {
  "Department 1": [
    {
      question: "What is the normal range for adult heart rate at rest?",
      options: ["40-60 bpm", "60-100 bpm", "100-120 bpm", "120-140 bpm"],
      correctAnswer: 1,
    },
    {
      question: "Which of the following is a sign of respiratory distress?",
      options: ["Normal breathing", "Use of accessory muscles", "Pink skin color", "Regular speech"],
      correctAnswer: 1,
    },
  ],
  "Department 2": [
    {
      question: "What is the proper hand hygiene duration?",
      options: ["5 seconds", "10 seconds", "20 seconds", "30 seconds"],
      correctAnswer: 2,
    },
    {
      question: "Which PPE should be worn first?",
      options: ["Gloves", "Mask", "Gown", "Eye protection"],
      correctAnswer: 2,
    },
  ],
  "Department 3": [
    {
      question: "What is the therapeutic range for warfarin INR?",
      options: ["1.0-1.5", "2.0-3.0", "3.5-4.0", "4.5-5.0"],
      correctAnswer: 1,
    },
    {
      question: "Which medication requires monitoring of liver function?",
      options: ["Aspirin", "Acetaminophen", "Ibuprofen", "Calcium"],
      correctAnswer: 1,
    },
  ],
}

export default function TrainerDashboard() {
  const [assignedDepartment, setAssignedDepartment] = useState("")
  const [trainerName, setTrainerName] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeTab, setActiveTab] = useState("chapters")
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  // Chapter management
  const [newChapterName, setNewChapterName] = useState("")
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const [editChapterName, setEditChapterName] = useState("")

  // Content form
  const [contentTitle, setContentTitle] = useState("")
  const [contentType, setContentType] = useState<"PDF" | "Video">("PDF")
  const [contentFile, setContentFile] = useState<File | null>(null)

  // MCQ form
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  // Edit states
  const [editingMCQ, setEditingMCQ] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editOptions, setEditOptions] = useState(["", "", "", ""])
  const [editCorrectAnswer, setEditCorrectAnswer] = useState(0)

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [requireResponse, setRequireResponse] = useState(false)
  const [meetingDate, setMeetingDate] = useState("")

  // Meeting management states
  const [meetings, setMeetings] = useState<any[]>([])
  const [attendanceCode, setAttendanceCode] = useState("")
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: boolean }>({})

  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem("userRole") !== "trainer") {
      router.push("/")
      return
    }

    // Get assigned department and trainer info
    const dept = localStorage.getItem("trainerDepartment") || ""
    const name = localStorage.getItem("trainerName") || "Trainer"

    setAssignedDepartment(dept)
    setTrainerName(name)

    // Load data from database
    loadTrainerData(dept)
  }, [router])

  const loadTrainerData = async (department: string) => {
    try {
      // Load chapters from database
      const chaptersResponse = await fetch(`/api/chapters?department=${encodeURIComponent(department)}`)
      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json()
        setChapters(chaptersData)
      }

      // Load notifications from database
      const notificationsResponse = await fetch(`/api/notifications?department=${encodeURIComponent(department)}`)
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData)
      }

      // Load meetings from database
      const meetingsResponse = await fetch(`/api/meetings?department=${encodeURIComponent(department)}`)
      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setMeetings(meetingsData)
      }
    } catch (error) {
      console.error("Error loading trainer data:", error)
    }
  }

  const saveChapters = async (updatedChapters: Chapter[]) => {
    // This function is no longer needed as we save individual chapters to database
    setChapters(updatedChapters)
  }

  const createChapter = async () => {
    if (!newChapterName.trim()) {
      alert("Please enter chapter name")
      return
    }

    try {
      const response = await fetch("/api/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChapterName.trim(),
          content: [],
          mcqs: [],
          department: assignedDepartment,
        }),
      })

      if (response.ok) {
        setNewChapterName("")
        await loadTrainerData(assignedDepartment) // Reload data
        alert("Chapter created successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create chapter")
      }
    } catch (error) {
      console.error("Error creating chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const updateChapterName = async () => {
    if (!editChapterName.trim()) {
      alert("Please enter chapter name")
      return
    }

    try {
      const response = await fetch("/api/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingChapter,
          name: editChapterName.trim(),
        }),
      })

      if (response.ok) {
        setEditingChapter(null)
        setEditChapterName("")
        await loadTrainerData(assignedDepartment) // Reload data
        alert("Chapter name updated successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update chapter")
      }
    } catch (error) {
      console.error("Error updating chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter? All content and MCQs will be lost.")) {
      return
    }

    try {
      const response = await fetch(`/api/chapters?id=${chapterId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (selectedChapter === chapterId) {
          setSelectedChapter(null)
        }
        await loadTrainerData(assignedDepartment) // Reload data
        alert("Chapter deleted successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete chapter")
      }
    } catch (error) {
      console.error("Error deleting chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const addContentToChapter = async () => {
    if (!selectedChapter || !contentTitle.trim()) {
      alert("Please select a chapter and enter content title")
      return
    }

    try {
      // Find the selected chapter
      const selectedChapterData = chapters.find(chapter => chapter.id === selectedChapter)
      if (!selectedChapterData) {
        alert("Selected chapter not found. Please try again.")
        return
      }
      
      // Create content object
      let fileUrl = "";
      let fileName = "";
      
      // Upload file if provided
      if (contentFile) {
        const formData = new FormData();
        formData.append('file', contentFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.fileUrl;
          fileName = uploadResult.fileName;
        } else {
          alert("Failed to upload file. Please try again.");
          return;
        }
      }
      
      const newContent: Content = {
        id: Date.now().toString(),
        title: contentTitle.trim(),
        type: contentType,
        url: fileUrl,
        fileName: fileName
      }
      
      // Add new content to the chapter
      const updatedContent = [...selectedChapterData.content, newContent]
      
      console.log("Updating chapter with ID:", selectedChapter)
      console.log("Updated content:", updatedContent)
      
      // Update the chapter in the database
      const response = await fetch("/api/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedChapter,
          content: updatedContent
        }),
      })

      if (response.ok) {
        // Update local state
        const updatedChapters = chapters.map((chapter) =>
          chapter.id === selectedChapter ? { ...chapter, content: updatedContent } : chapter,
        )
        setChapters(updatedChapters)
        setContentTitle("")
        setContentFile(null)
        
        // Reset file input
        const fileInput = document.getElementById("contentFile") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        
        alert("Content added to chapter successfully!")
        
        // Reload data to ensure we have the latest from the database
        await loadTrainerData(assignedDepartment)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add content to chapter")
      }
    } catch (error) {
      console.error("Error adding content to chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const addMCQToChapter = async () => {
    if (!selectedChapter || !question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please select a chapter and fill all MCQ fields")
      return
    }

    const newMCQ: MCQ = {
      id: Date.now().toString(),
      question: question.trim(),
      options: options.map((opt) => opt.trim()),
      correctAnswer,
      isAIGenerated: false,
    }

    try {
      // Find the selected chapter
      const selectedChapterData = chapters.find(chapter => chapter.id === selectedChapter)
      if (!selectedChapterData) {
        alert("Selected chapter not found. Please try again.")
        return
      }
      
      // Add new MCQ to the chapter
      const updatedMCQs = [...selectedChapterData.mcqs, newMCQ]
      
      console.log("Updating chapter with ID:", selectedChapter)
      console.log("Updated MCQs:", updatedMCQs)
      
      // Update the chapter in the database
      const response = await fetch("/api/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedChapter,
          mcqs: updatedMCQs
        }),
      })

      if (response.ok) {
        // Update local state
        const updatedChapters = chapters.map((chapter) =>
          chapter.id === selectedChapter ? { ...chapter, mcqs: updatedMCQs } : chapter,
        )
        setChapters(updatedChapters)
        setQuestion("")
        setOptions(["", "", "", ""])
        setCorrectAnswer(0)
        alert("MCQ added to chapter successfully!")
        
        // Reload data to ensure we have the latest from the database
        await loadTrainerData(assignedDepartment)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add MCQ to chapter")
      }
    } catch (error) {
      console.error("Error adding MCQ to chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const generateAIMCQsForChapter = async () => {
    if (!selectedChapter) {
      alert("Please select a chapter first")
      return
    }

    const templates =
      AI_MCQ_TEMPLATES[assignedDepartment as keyof typeof AI_MCQ_TEMPLATES] || AI_MCQ_TEMPLATES["Department 1"]

    const aiMCQs = templates.map((template, index) => ({
      id: `ai_${Date.now()}_${index}`,
      question: template.question,
      options: template.options,
      correctAnswer: template.correctAnswer,
      isAIGenerated: true,
    }))

    try {
      // Find the selected chapter
      const selectedChapterData = chapters.find(chapter => chapter.id === selectedChapter)
      if (!selectedChapterData) return
      
      // Add AI MCQs to the chapter
      const updatedMCQs = [...selectedChapterData.mcqs, ...aiMCQs]
      
      // Update the chapter in the database
      const response = await fetch("/api/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedChapter,
          mcqs: updatedMCQs
        }),
      })

      if (response.ok) {
        // Update local state
        const updatedChapters = chapters.map((chapter) =>
          chapter.id === selectedChapter ? { ...chapter, mcqs: updatedMCQs } : chapter,
        )
        setChapters(updatedChapters)
        alert(`Generated ${aiMCQs.length} AI MCQs for the selected chapter!`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add AI MCQs to chapter")
      }
    } catch (error) {
      console.error("Error adding AI MCQs to chapter:", error)
      alert("Network error. Please try again.")
    }
  }

  const deleteContentFromChapter = async (chapterId: string, contentId: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        // Find the chapter
        const chapterToUpdate = chapters.find(chapter => chapter.id === chapterId)
        if (!chapterToUpdate) return
        
        // Filter out the content to delete
        const updatedContent = chapterToUpdate.content.filter(content => content.id !== contentId)
        
        // Update the chapter in the database
        const response = await fetch("/api/chapters", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: chapterId,
            content: updatedContent
          }),
        })

        if (response.ok) {
          // Update local state
          const updatedChapters = chapters.map((chapter) =>
            chapter.id === chapterId
              ? { ...chapter, content: updatedContent }
              : chapter,
          )
          setChapters(updatedChapters)
        } else {
          const error = await response.json()
          alert(error.error || "Failed to delete content")
        }
      } catch (error) {
        console.error("Error deleting content:", error)
        alert("Network error. Please try again.")
      }
    }
  }

  const deleteMCQFromChapter = async (chapterId: string, mcqId: string) => {
    if (confirm("Are you sure you want to delete this MCQ?")) {
      try {
        // Find the chapter
        const chapterToUpdate = chapters.find(chapter => chapter.id === chapterId)
        if (!chapterToUpdate) return
        
        // Filter out the MCQ to delete
        const updatedMCQs = chapterToUpdate.mcqs.filter(mcq => mcq.id !== mcqId)
        
        // Update the chapter in the database
        const response = await fetch("/api/chapters", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: chapterId,
            mcqs: updatedMCQs
          }),
        })

        if (response.ok) {
          // Update local state
          const updatedChapters = chapters.map((chapter) =>
            chapter.id === chapterId ? { ...chapter, mcqs: updatedMCQs } : chapter,
          )
          setChapters(updatedChapters)
        } else {
          const error = await response.json()
          alert(error.error || "Failed to delete MCQ")
        }
      } catch (error) {
        console.error("Error deleting MCQ:", error)
        alert("Network error. Please try again.")
      }
    }
  }

  const startEditMCQ = (mcq: MCQ) => {
    setEditingMCQ(mcq.id)
    setEditQuestion(mcq.question)
    setEditOptions(mcq.options)
    setEditCorrectAnswer(mcq.correctAnswer)
  }

  const saveEditMCQ = async () => {
    if (!editQuestion.trim() || editOptions.some((opt) => !opt.trim())) {
      alert("Please fill all fields")
      return
    }

    try {
      // Find the chapter containing the MCQ
      let chapterWithMCQ: Chapter | undefined
      let chapterIndex = -1

      for (let i = 0; i < chapters.length; i++) {
        const mcqIndex = chapters[i].mcqs.findIndex(mcq => mcq.id === editingMCQ)
        if (mcqIndex >= 0) {
          chapterWithMCQ = chapters[i]
          chapterIndex = i
          break
        }
      }

      if (!chapterWithMCQ) {
        alert("Could not find the MCQ to edit")
        return
      }

      // Update the MCQ
      const updatedMCQs = chapterWithMCQ.mcqs.map((mcq) =>
        mcq.id === editingMCQ
          ? {
              ...mcq,
              question: editQuestion.trim(),
              options: editOptions.map((opt) => opt.trim()),
              correctAnswer: editCorrectAnswer,
            }
          : mcq
      )

      // Update the chapter in the database
      const response = await fetch("/api/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chapterWithMCQ.id,
          mcqs: updatedMCQs
        }),
      })

      if (response.ok) {
        // Update local state
        const updatedChapters = [...chapters]
        updatedChapters[chapterIndex] = {
          ...chapterWithMCQ,
          mcqs: updatedMCQs
        }
        
        setChapters(updatedChapters)
        setEditingMCQ(null)
        alert("MCQ updated successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update MCQ")
      }
    } catch (error) {
      console.error("Error updating MCQ:", error)
      alert("Network error. Please try again.")
    }
  }

  const cancelEdit = () => {
    setEditingMCQ(null)
    setEditQuestion("")
    setEditOptions(["", "", "", ""])
    setEditCorrectAnswer(0)
  }

  const selectedChapterData = chapters.find((chapter) => chapter.id === selectedChapter)

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      alert("Please enter notification title and message")
      return
    }

    try {
      const notificationData = {
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        sender: trainerName,
        senderRole: "trainer",
        department: assignedDepartment,
        requireResponse,
        meetingDate: requireResponse ? meetingDate : null,
        responses: {},
      }

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      })

      if (response.ok) {
        // If it's a meeting request, also save to meetings
        if (requireResponse) {
          const meetingData = {
            title: notificationTitle.trim(),
            message: notificationMessage.trim(),
            date: meetingDate,
            department: assignedDepartment,
            trainer: trainerName,
            responses: {},
            attendanceMarked: false,
            attendanceCode: "",
          }

          await fetch("/api/meetings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(meetingData),
          })
        }

        setNotificationTitle("")
        setNotificationMessage("")
        setRequireResponse(false)
        setMeetingDate("")

        await loadTrainerData(assignedDepartment) // Reload data
        alert("Notification sent successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send notification")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Network error. Please try again.")
    }
  }

  const generateAttendanceCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString()
    setAttendanceCode(code)

    // Save the code to the selected meeting
    if (selectedMeeting) {
      const updatedMeetings = meetings.map((meeting) =>
        meeting.id === selectedMeeting
          ? { ...meeting, attendanceCode: code, codeGeneratedAt: new Date().toISOString() }
          : meeting,
      )
      setMeetings(updatedMeetings)

      const allMeetings = JSON.parse(localStorage.getItem("meetings") || "[]")
      const updatedAllMeetings = allMeetings.map((meeting: any) =>
        meeting.id === selectedMeeting
          ? { ...meeting, attendanceCode: code, codeGeneratedAt: new Date().toISOString() }
          : meeting,
      )
      localStorage.setItem("meetings", JSON.stringify(updatedAllMeetings))
    }
  }

  const markAttendance = (traineeId: string, present: boolean) => {
    setAttendanceData((prev) => ({
      ...prev,
      [traineeId]: present,
    }))
  }

  const submitAttendance = () => {
    if (!selectedMeeting) return

    const meeting = meetings.find((m) => m.id === selectedMeeting)
    if (!meeting) return

    const attendanceRecord = {
      meetingId: selectedMeeting,
      meetingTitle: meeting.title,
      date: meeting.date,
      department: assignedDepartment,
      trainer: trainerName,
      attendance: attendanceData,
      submittedAt: new Date().toISOString(),
    }

    // Save attendance record
    const savedAttendanceRecords = JSON.parse(localStorage.getItem("meetingAttendance") || "[]")
    savedAttendanceRecords.push(attendanceRecord)
    localStorage.setItem("meetingAttendance", JSON.stringify(savedAttendanceRecords))

    // Mark meeting as attendance completed
    const updatedMeetings = meetings.map((m) =>
      m.id === selectedMeeting ? { ...m, attendanceMarked: true, attendanceSubmittedAt: new Date().toISOString() } : m,
    )
    setMeetings(updatedMeetings)

    const allMeetings = JSON.parse(localStorage.getItem("meetings") || "[]")
    const updatedAllMeetings = allMeetings.map((meeting: any) =>
      meeting.id === selectedMeeting
        ? { ...meeting, attendanceMarked: true, attendanceSubmittedAt: new Date().toISOString() }
        : meeting,
    )
    localStorage.setItem("meetings", JSON.stringify(updatedAllMeetings))

    alert("Attendance submitted successfully!")
    setSelectedMeeting(null)
    setAttendanceData({})
  }

  const downloadAttendanceData = (format: "pdf" | "csv") => {
    const savedAttendanceRecords = JSON.parse(localStorage.getItem("meetingAttendance") || "[]")
    const deptRecords = savedAttendanceRecords.filter((record: any) => record.department === assignedDepartment)

    if (format === "csv") {
      let csvContent = "Meeting Title,Date,Department,Trainer,Trainee,Present\n"

      deptRecords.forEach((record: any) => {
        Object.entries(record.attendance).forEach(([traineeId, present]) => {
          csvContent += `"${record.meetingTitle}","${record.date}","${record.department}","${record.trainer}","${traineeId}","${present}"\n`
        })
      })

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meeting_attendance_${assignedDepartment.replace(" ", "_")}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // Simple text format for PDF
      let content = `MEETING ATTENDANCE REPORT\n\nDepartment: ${assignedDepartment}\nTrainer: ${trainerName}\nGenerated: ${new Date().toLocaleDateString()}\n\n`

      deptRecords.forEach((record: any) => {
        content += `Meeting: ${record.meetingTitle}\nDate: ${record.date}\n\nAttendance:\n`
        Object.entries(record.attendance).forEach(([traineeId, present]) => {
          content += `- ${traineeId}: ${present ? "Present" : "Absent"}\n`
        })
        content += "\n---\n\n"
      })

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meeting_attendance_${assignedDepartment.replace(" ", "_")}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }



  

  return (
    <Layout userRole="trainer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trainer Dashboard</h1>
          <p className="text-gray-600">
            Welcome {trainerName} - Assigned to: {assignedDepartment}
          </p>
        </div>

        {assignedDepartment && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("chapters")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "chapters" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Manage Chapters
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "content" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Add Content
              </button>
              <button
                onClick={() => setActiveTab("mcq")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "mcq" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Add MCQs
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("meetings")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "meetings" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Meetings
              </button>
            </div>

            {/* Chapters Management Tab */}
            {activeTab === "chapters" && (
              <>
                {/* Create New Chapter */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Chapter</CardTitle>
                    <CardDescription>Add chapters/sections to organize your training content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="chapterName">Chapter Name</Label>
                        <Input
                          id="chapterName"
                          placeholder="Enter chapter name"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && createChapter()}
                        />
                      </div>
                      <Button onClick={createChapter} className="mt-6">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Chapter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Chapters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Chapters</CardTitle>
                    <CardDescription>Manage your training chapters and their content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chapters.length > 0 ? (
                      <div className="space-y-4">
                        {chapters.map((chapter, index) => (
                          <div key={chapter.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  {editingChapter === chapter.id ? (
                                    <div className="flex gap-2">
                                      <Input
                                        value={editChapterName}
                                        onChange={(e) => setEditChapterName(e.target.value)}
                                        className="w-64"
                                      />
                                      <Button onClick={updateChapterName} size="sm">
                                        Save
                                      </Button>
                                      <Button onClick={() => setEditingChapter(null)} variant="outline" size="sm">
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <h3 className="font-semibold">
                                        Chapter {index + 1}: {chapter.name}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        {chapter.content.length} content items, {chapter.mcqs.length} MCQs
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingChapter(chapter.id)
                                    setEditChapterName(chapter.name)
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => deleteChapter(chapter.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Chapter Content Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h4 className="font-medium mb-2">Content ({chapter.content.length})</h4>
                                {chapter.content.length > 0 ? (
                                  <div className="space-y-1">
                                    {chapter.content.slice(0, 3).map((content) => (
                                      <div key={content.id} className="flex items-center gap-2 text-sm">
                                        {content.type === "PDF" ? (
                                          <FileText className="h-3 w-3 text-red-500" />
                                        ) : (
                                          <Video className="h-3 w-3 text-blue-500" />
                                        )}
                                        <span className="truncate">{content.title}</span>
                                        <Button
                                          onClick={() => deleteContentFromChapter(chapter.id, content.id)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    {chapter.content.length > 3 && (
                                      <p className="text-xs text-gray-500">+{chapter.content.length - 3} more items</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No content added</p>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">MCQs ({chapter.mcqs.length})</h4>
                                {chapter.mcqs.length > 0 ? (
                                  <div className="space-y-1">
                                    {chapter.mcqs.slice(0, 2).map((mcq, mcqIndex) => (
                                      <div key={mcq.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Q{mcqIndex + 1}</span>
                                          <span className="truncate max-w-32">{mcq.question}</span>
                                          {mcq.isAIGenerated && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-1 py-0.5 rounded-full">
                                              AI
                                            </span>
                                          )}
                                        </div>
                                        <Button
                                          onClick={() => deleteMCQFromChapter(chapter.id, mcq.id)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    {chapter.mcqs.length > 2 && (
                                      <p className="text-xs text-gray-500">+{chapter.mcqs.length - 2} more MCQs</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No MCQs added</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No chapters created yet</p>
                        <p className="text-sm">Create your first chapter to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Content Addition Tab */}
            {activeTab === "content" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Content to Chapter</CardTitle>
                  <CardDescription>Add training materials to a specific chapter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Chapter</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {chapters.map((chapter, index) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapter(chapter.id)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedChapter === chapter.id
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">
                              Chapter {index + 1}: {chapter.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{chapter.content.length} content items</p>
                        </button>
                      ))}
                    </div>
                    {chapters.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No chapters available. Create a chapter first in the "Manage Chapters" tab.
                      </p>
                    )}
                  </div>

                  {selectedChapter && (
                    <div>
                      <div>
                        <Label htmlFor="contentTitle">Content Title</Label>
                        <Input
                          id="contentTitle"
                          placeholder="Enter content title"
                          value={contentTitle}
                          onChange={(e) => setContentTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Content Type</Label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="PDF"
                              checked={contentType === "PDF"}
                              onChange={(e) => setContentType(e.target.value as "PDF" | "Video")}
                            />
                            <FileText className="h-4 w-4" />
                            PDF Document
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="Video"
                              checked={contentType === "Video"}
                              onChange={(e) => setContentType(e.target.value as "PDF" | "Video")}
                            />
                            <Video className="h-4 w-4" />
                            Video
                          </label>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor="contentFile">Upload {contentType} File (optional)</Label>
                          <Input
                            id="contentFile"
                            type="file"
                            accept={contentType === "PDF" ? ".pdf" : "video/*"}
                            className="mt-1"
                            onChange={(e) => setContentFile(e.target.files ? e.target.files[0] : null)}
                          />
                        </div>
                      </div>

                      <Button type="button" onClick={addContentToChapter} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Add Content to Chapter
                      </Button>

                      {/* Show current chapter content */}
                      {selectedChapterData && selectedChapterData.content.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">
                            Content in "{selectedChapterData.name}" ({selectedChapterData.content.length})
                          </h3>
                          <div className="space-y-2">
                            {selectedChapterData.content.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  {item.type === "PDF" ? (
                                    <FileText className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <Video className="h-5 w-5 text-blue-500" />
                                  )}
                                  <div>
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-sm text-gray-500">{item.type}</div>
                                    {item.fileName && (
                                      <div className="text-xs text-gray-400">{item.fileName}</div>
                                    )}
                                    {item.url && (
                                      <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline"
                                      >
                                        View {item.type}
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteContentFromChapter(selectedChapterData.id, item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* MCQ Addition Tab */}
            {activeTab === "mcq" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add MCQs to Chapter</CardTitle>
                  <CardDescription>Add multiple choice questions to a specific chapter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Chapter</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {chapters.map((chapter, index) => (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapter(chapter.id)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedChapter === chapter.id
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">
                              Chapter {index + 1}: {chapter.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{chapter.mcqs.length} MCQs</p>
                        </button>
                      ))}
                    </div>
                    {chapters.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No chapters available. Create a chapter first in the "Manage Chapters" tab.
                      </p>
                    )}
                  </div>

                  {selectedChapter && (
                    <>
                      {/* AI MCQ Generation */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-purple-800">AI-Powered MCQ Generation</h3>
                            <p className="text-sm text-purple-600">
                              Generate department-specific questions for this chapter
                            </p>
                          </div>
                          <Button onClick={generateAIMCQsForChapter} className="bg-purple-600 hover:bg-purple-700">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI MCQs
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          placeholder="Enter your question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {options.map((option, index) => (
                            <Input
                              key={index}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...options]
                                newOptions[index] = e.target.value
                                setOptions(newOptions)
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Correct Answer</Label>
                        <RadioGroup
                          value={correctAnswer.toString()}
                          onValueChange={(value) => setCorrectAnswer(Number.parseInt(value))}
                          className="flex flex-row space-x-4"
                        >
                          {options.map((_, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <Button onClick={addMCQToChapter} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add MCQ to Chapter
                      </Button>

                      {/* Show current chapter MCQs */}
                      {selectedChapterData && selectedChapterData.mcqs.length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">
                            MCQs in "{selectedChapterData.name}" ({selectedChapterData.mcqs.length})
                          </h3>
                          <div className="space-y-4">
                            {selectedChapterData.mcqs.map((mcq, index) => (
                              <div key={mcq.id} className="p-4 bg-gray-50 rounded-lg">
                                {editingMCQ === mcq.id ? (
                                  // Edit Mode
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Edit Question</Label>
                                      <Textarea
                                        value={editQuestion}
                                        onChange={(e) => setEditQuestion(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <Label>Edit Options</Label>
                                      <div className="space-y-2">
                                        {editOptions.map((option, optIndex) => (
                                          <Input
                                            key={optIndex}
                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                            value={option}
                                            onChange={(e) => {
                                              const newOptions = [...editOptions]
                                              newOptions[optIndex] = e.target.value
                                              setEditOptions(newOptions)
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Correct Answer</Label>
                                      <RadioGroup
                                        value={editCorrectAnswer.toString()}
                                        onValueChange={(value) => setEditCorrectAnswer(Number.parseInt(value))}
                                        className="flex flex-row space-x-4"
                                      >
                                        {editOptions.map((_, optIndex) => (
                                          <div key={optIndex} className="flex items-center space-x-2">
                                            <RadioGroupItem
                                              value={optIndex.toString()}
                                              id={`edit-option-${optIndex}`}
                                            />
                                            <Label htmlFor={`edit-option-${optIndex}`}>
                                              Option {String.fromCharCode(65 + optIndex)}
                                            </Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={saveEditMCQ} size="sm">
                                        Save Changes
                                      </Button>
                                      <Button onClick={cancelEdit} variant="outline" size="sm">
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // View Mode
                                  <>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">Question {index + 1}</h4>
                                        {mcq.isAIGenerated && (
                                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                            AI Generated
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => startEditMCQ(mcq)}
                                          className="text-blue-500 hover:text-blue-700"
                                        >
                                          <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteMCQFromChapter(selectedChapterData.id, mcq.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="mb-3">{mcq.question}</p>
                                    <div className="space-y-1">
                                      {mcq.options.map((option, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className={`p-2 rounded ${
                                            optIndex === mcq.correctAnswer
                                              ? "bg-green-100 text-green-800 font-medium"
                                              : "bg-white"
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}. {option}
                                          {optIndex === mcq.correctAnswer && " ✓"}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <>
                {/* Send Notification */}
                <Card>
                  <CardHeader>
                    <CardTitle>Send Notification to Department</CardTitle>
                    <CardDescription>
                      Send updates and announcements to trainees in {assignedDepartment}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="notificationTitle">Notification Title</Label>
                      <Input
                        id="notificationTitle"
                        placeholder="Enter notification title"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notificationMessage">Message</Label>
                      <Textarea
                        id="notificationMessage"
                        placeholder="Enter your message or update"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireResponse"
                        checked={requireResponse}
                        onChange={(e) => setRequireResponse(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="requireResponse">Require Yes/No response (Meeting Request)</Label>
                    </div>

                    {requireResponse && (
                      <div>
                        <Label htmlFor="meetingDate">Meeting Date</Label>
                        <Input
                          id="meetingDate"
                          type="date"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                        />
                      </div>
                    )}

                    <Button onClick={sendNotification} className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Your sent notifications and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {notifications.filter((n) => n.senderRole === "trainer").length > 0 ? (
                      <div className="space-y-3">
                        {notifications
                          .filter((n) => n.senderRole === "trainer")
                          .slice(0, 5)
                          .map((notification) => (
                            <div key={notification.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{notification.title}</h4>
                                <span className="text-xs text-gray-500">{notification.date}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              {notification.requireResponse && (
                                <div className="text-xs text-blue-600">
                                  Meeting Request • {notification.meetingDate}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No notifications sent yet</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Meetings Tab */}
            {activeTab === "meetings" && (
              <>
                {/* Meeting Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Management</CardTitle>
                    <CardDescription>Manage meetings and attendance for {assignedDepartment}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {meetings.length > 0 ? (
                      <div className="space-y-4">
                        {meetings.map((meeting) => {
                          const responses = Object.entries(meeting.responses || {})
                          const yesResponses = responses.filter(([_, response]) => response === true)

                          return (
                            <div key={meeting.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium">{meeting.title}</h4>
                                  <p className="text-sm text-gray-600">{meeting.message}</p>
                                  <p className="text-sm text-blue-600">Meeting Date: {meeting.date}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Responses: {responses.length}</div>
                                  <div className="text-sm text-green-600">Yes: {yesResponses.length}</div>
                                </div>
                              </div>

                              {yesResponses.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="font-medium text-sm mb-2">Attendees ({yesResponses.length}):</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {yesResponses.map(([traineeId]) => (
                                      <span
                                        key={traineeId}
                                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                                      >
                                        {traineeId}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setSelectedMeeting(meeting.id)}
                                  variant="outline"
                                  size="sm"
                                  disabled={yesResponses.length === 0}
                                >
                                  Mark Attendance
                                </Button>

                                {meeting.attendanceMarked && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Attendance Submitted
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No meetings scheduled</p>
                    )}
                  </CardContent>
                </Card>

                {/* Attendance Code Generation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Code Generator</CardTitle>
                    <CardDescription>Generate 5-digit codes for meeting attendance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={generateAttendanceCode} className="flex-1">
                        Generate New Code
                      </Button>
                      {attendanceCode && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                          <span className="font-mono text-2xl font-bold text-blue-600">{attendanceCode}</span>
                        </div>
                      )}
                    </div>
                    {attendanceCode && (
                      <p className="text-sm text-gray-600">Share this code with trainees for attendance marking</p>
                    )}
                  </CardContent>
                </Card>

                {/* Manual Attendance Marking */}
                {selectedMeeting && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Mark Attendance</CardTitle>
                      <CardDescription>
                        Mark attendance for meeting: {meetings.find((m) => m.id === selectedMeeting)?.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const meeting = meetings.find((m) => m.id === selectedMeeting)
                        const yesResponses = Object.entries(meeting?.responses || {}).filter(
                          ([_, response]) => response === true,
                        )

                        return (
                          <>
                            {yesResponses.length > 0 ? (
                              <>
                                <div className="space-y-2">
                                  {yesResponses.map(([traineeId]) => (
                                    <div
                                      key={traineeId}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <span className="font-medium">{traineeId}</span>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => markAttendance(traineeId, true)}
                                          variant={attendanceData[traineeId] === true ? "default" : "outline"}
                                          size="sm"
                                        >
                                          Present
                                        </Button>
                                        <Button
                                          onClick={() => markAttendance(traineeId, false)}
                                          variant={attendanceData[traineeId] === false ? "destructive" : "outline"}
                                          size="sm"
                                        >
                                          Absent
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2">
                                  <Button onClick={submitAttendance} className="flex-1">
                                    Submit Attendance
                                  </Button>
                                  <Button onClick={() => setSelectedMeeting(null)} variant="outline">
                                    Cancel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No attendees for this meeting</p>
                            )}
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Download Attendance Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Download Attendance Data</CardTitle>
                    <CardDescription>Export meeting attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button onClick={() => downloadAttendanceData("csv")} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button onClick={() => downloadAttendanceData("pdf")} variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
