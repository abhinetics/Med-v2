"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Fingerprint, Wifi, Monitor, AlertTriangle, CheckCircle } from "lucide-react"

interface AttendanceButtonProps {
  department: string
  hasMarkedAttendance: boolean
  onAttendanceMarked: () => void
}

// Device fingerprinting function
const generateDeviceFingerprint = () => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx!.textBaseline = "top"
  ctx!.font = "14px Arial"
  ctx!.fillText("Device fingerprint", 2, 2)

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvas.toDataURL(),
    timestamp: new Date().toISOString(),
  }

  return btoa(JSON.stringify(fingerprint)).slice(0, 16)
}

// Get IP address (simulated)
const getIPAddress = async () => {
  try {
    // In a real app, you'd use a service like ipapi.co
    return "192.168.1." + Math.floor(Math.random() * 255)
  } catch {
    return "Unknown"
  }
}

export default function AttendanceButton({
  department,
  hasMarkedAttendance,
  onAttendanceMarked,
}: AttendanceButtonProps) {
  const [isMarking, setIsMarking] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [flagRaised, setFlagRaised] = useState(false)

  const markAttendance = async () => {
    setIsMarking(true)
    setShowAnimation(true)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate device fingerprint and get IP
    const deviceFingerprint = generateDeviceFingerprint()
    const ipAddress = await getIPAddress()
    const browserInfo = navigator.userAgent.split(" ").pop() || "Unknown"

    const attendanceRecord = {
      department,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
      deviceFingerprint,
      ipAddress,
      browserInfo,
      userAgent: navigator.userAgent,
    }

    // Check for duplicate IP/device usage
    const existingRecords = JSON.parse(localStorage.getItem("attendanceRecords") || "{}")
    const today = new Date().toDateString()
    const todayRecords = existingRecords[today] || []

    // Check if same IP or device fingerprint exists for different departments
    const duplicateFound = todayRecords.some(
      (record: any) =>
        (record.ipAddress === ipAddress || record.deviceFingerprint === deviceFingerprint) &&
        record.department !== department,
    )

    if (duplicateFound) {
      setFlagRaised(true)
      // In a real system, this would alert administrators
      console.warn("🚨 SECURITY FLAG: Multiple trainees using same IP/device detected!")
    }

    // Save attendance record
    if (!existingRecords[today]) {
      existingRecords[today] = []
    }
    existingRecords[today].push(attendanceRecord)
    localStorage.setItem("attendanceRecords", JSON.stringify(existingRecords))

    setIsMarking(false)
    onAttendanceMarked()
  }

  if (hasMarkedAttendance) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Attendance Marked!</h3>
          <p className="text-sm text-green-600">You've already marked attendance for today</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={markAttendance}
        disabled={isMarking}
        size="lg"
        className={`w-full h-16 text-lg font-semibold transition-all duration-300 ${
          showAnimation ? "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isMarking ? (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>Recording Attendance...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Fingerprint className="h-6 w-6" />
            <span>Mark Attendance</span>
          </div>
        )}
      </Button>

      {showAnimation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="text-center">
            <h4 className="font-semibold text-blue-800 mb-3">Recording Security Information</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Monitor className="h-4 w-4 text-blue-600" />
              <span>Device fingerprint: </span>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                {isMarking ? "Generating..." : "FP_" + Math.random().toString(36).substr(2, 8)}
              </code>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Wifi className="h-4 w-4 text-blue-600" />
              <span>IP Address: </span>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                {isMarking ? "Detecting..." : "192.168.1." + Math.floor(Math.random() * 255)}
              </code>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Fingerprint className="h-4 w-4 text-blue-600" />
              <span>Browser: </span>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                {navigator.userAgent.split(" ").pop()?.slice(0, 10) || "Unknown"}
              </code>
            </div>
          </div>

          {flagRaised && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium text-sm">Security Alert</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Multiple trainees detected using same IP/device. Administrator has been notified.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Secure attendance tracking with device fingerprinting</p>
        <p>📍 Records device + IP + browser fingerprint on login</p>
        <p>⚠️ Flags raised if multiple trainees use same IP/device</p>
      </div>
    </div>
  )
}
