"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, Building2, RotateCcw, Plus, Trash2, UserPlus, Bell } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Trainer {
  _id: string
  name: string
  username: string
  department: string
  password: string
  dateAdded: string
}

interface Department {
  _id: string
  name: string
}

interface Trainee {
  _id: string
  fullName: string
  username: string
  email: string
  department: string
  signupDate: string
}

export default function AdminDashboard() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [newDepartment, setNewDepartment] = useState("")
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [newTrainerName, setNewTrainerName] = useState("")
  const [newTrainerUsername, setNewTrainerUsername] = useState("")
  const [newTrainerDepartment, setNewTrainerDepartment] = useState("")
  const [newTrainerPassword, setNewTrainerPassword] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalTrainees: 0,
    totalDepartments: 0,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [traineeAnalytics, setTraineeAnalytics] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTrainees, setFilteredTrainees] = useState<any[]>([])

  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [selectedNotificationDepartment, setSelectedNotificationDepartment] = useState("")

  useEffect(() => {
    // Check authentication
    if (localStorage.getItem("userRole") !== "admin") {
      router.push("/")
      return
    }

    // Load all data from database
    loadDashboardData()
  }, [router])

  useEffect(() => {
    const filtered = traineeAnalytics.filter(
      (trainee) =>
        trainee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTrainees(filtered)
  }, [searchTerm, traineeAnalytics])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load departments
      const deptResponse = await fetch("/api/departments")
      if (deptResponse.ok) {
        const depts = await deptResponse.json()
        setDepartments(depts)
      }

      // Load trainers
      const trainersResponse = await fetch("/api/trainers")
      if (trainersResponse.ok) {
        const trainersData = await trainersResponse.json()
        setTrainers(trainersData)
      }

      // Load trainees
      const traineesResponse = await fetch("/api/trainees")
      if (traineesResponse.ok) {
        const traineesData = await traineesResponse.json()
        setTraineeAnalytics(traineesData)
        setFilteredTrainees(traineesData)
      }

      // Update stats
      const deptCount = departments.length
      const trainerCount = trainers.length
      const traineeCount = traineeAnalytics.length

      setStats({
        totalTrainers: trainerCount,
        totalTrainees: traineeCount,
        totalDepartments: deptCount,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const addDepartment = async () => {
    if (!newDepartment.trim()) {
      alert("Please enter department name")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newDepartment.trim() }),
      })

      if (response.ok) {
        setNewDepartment("")
        await loadDashboardData() // Reload data
        alert("Department added successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add department")
      }
    } catch (error) {
      console.error("Error adding department:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addTrainer = async () => {
    if (!newTrainerName.trim() || !newTrainerUsername.trim() || !newTrainerDepartment || !newTrainerPassword.trim()) {
      alert("Please fill all trainer details")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/trainers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTrainerName.trim(),
          username: newTrainerUsername.trim(),
          department: newTrainerDepartment,
          password: newTrainerPassword.trim(),
        }),
      })

      if (response.ok) {
        // Reset form
        setNewTrainerName("")
        setNewTrainerUsername("")
        setNewTrainerDepartment("")
        setNewTrainerPassword("")
        await loadDashboardData() // Reload data
        alert("Trainer added successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add trainer")
      }
    } catch (error) {
      console.error("Error adding trainer:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const removeTrainer = async (trainerId: string) => {
    if (!confirm("Are you sure you want to remove this trainer?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/trainers?id=${trainerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadDashboardData() // Reload data
        alert("Trainer removed successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to remove trainer")
      }
    } catch (error) {
      console.error("Error removing trainer:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      alert("Please enter notification title and message")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notificationTitle.trim(),
          message: notificationMessage.trim(),
          sender: "Admin",
          senderRole: "admin",
          department: selectedNotificationDepartment || "all",
        }),
      })

      if (response.ok) {
        setNotificationTitle("")
        setNotificationMessage("")
        setSelectedNotificationDepartment("")
        alert(`Notification sent to ${selectedNotificationDepartment || "all departments"}!`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send notification")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetLMS = async () => {
    if (!confirm("Are you sure you want to reset the entire LMS? This will clear all data.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/reset-lms", {
        method: "POST",
      })

      if (response.ok) {
        await loadDashboardData() // Reload data
        alert("LMS has been reset successfully!")
      } else {
        alert("Failed to reset LMS")
      }
    } catch (error) {
      console.error("Error resetting LMS:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      if (response.ok) {
        alert("Database initialized successfully!")
        loadDashboardData() // Reload data
      } else {
        const error = await response.json()
        alert(error.error || "Failed to initialize database")
      }
    } catch (error) {
      console.error("Database initialization error:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage the MedTrain System</p>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overview" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("trainers")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "trainers" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Manage Trainers
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "departments" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "analytics" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Trainee Analytics
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "notifications" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Send Notifications
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainers.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{traineeAnalytics.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building2 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{departments.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* System Actions */}
            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Manage system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button onClick={resetLMS} variant="destructive" className="flex items-center gap-2 mr-4" disabled={loading}>
                    <RotateCcw className="h-4 w-4" />
                    Reset LMS
                  </Button>
                  <Button 
                    onClick={initializeDatabase} 
                    variant="outline" 
                    className="flex items-center gap-2" 
                    disabled={loading}
                  >
                    <Building2 className="h-4 w-4" />
                    Initialize Database
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Note: Initialize Database will only create default departments and admin user if they don't exist.</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Trainers Management Tab */}
        {activeTab === "trainers" && (
          <>
            {/* Add New Trainer */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Trainer</CardTitle>
                <CardDescription>Create trainer accounts with username and department assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trainerName">Trainer Name</Label>
                    <Input
                      id="trainerName"
                      placeholder="Enter trainer name"
                      value={newTrainerName}
                      onChange={(e) => setNewTrainerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainerUsername">Username</Label>
                    <Input
                      id="trainerUsername"
                      placeholder="Enter username"
                      value={newTrainerUsername}
                      onChange={(e) => setNewTrainerUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainerDept">Department</Label>
                    <Select value={newTrainerDepartment} onValueChange={setNewTrainerDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trainerPassword">Password</Label>
                    <Input
                      id="trainerPassword"
                      type="password"
                      placeholder="Set password"
                      value={newTrainerPassword}
                      onChange={(e) => setNewTrainerPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={addTrainer} className="w-full" disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add Trainer"}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Trainers */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Trainers</CardTitle>
                <CardDescription>Manage trainer accounts and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {trainers.length > 0 ? (
                  <div className="space-y-3">
                    {trainers.map((trainer) => (
                      <div key={trainer._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{trainer.name}</div>
                            <div className="text-sm text-gray-500">@{trainer.username}</div>
                            <div className="text-sm text-gray-500">{trainer.department}</div>
                            <div className="text-xs text-gray-400">Added: {trainer.dateAdded}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrainer(trainer._id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No trainers added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Department Management Tab */}
        {activeTab === "departments" && (
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>Add and view hospital departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newDepartment">Add New Department</Label>
                  <Input
                    id="newDepartment"
                    placeholder="Enter department name"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addDepartment()}
                  />
                </div>
                <Button onClick={addDepartment} className="mt-6" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add"}
                </Button>
              </div>

              <div>
                <Label>Existing Departments</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {departments.map((dept) => (
                    <div key={dept._id} className="bg-blue-50 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trainee Analytics Tab */}
        {activeTab === "analytics" && (
          <>
            {/* Search Box */}
            <Card>
              <CardHeader>
                <CardTitle>Trainee Performance Analytics</CardTitle>
                <CardDescription>Monitor trainee progress and performance across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="search">Search Trainees</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, username, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analytics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Showing {filteredTrainees.length} of {traineeAnalytics.length} trainees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTrainees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Name</th>
                          <th className="text-left p-3 font-semibold">Username</th>
                          <th className="text-left p-3 font-semibold">Email</th>
                          <th className="text-left p-3 font-semibold">Department</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Signup Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrainees.map((trainee) => (
                          <tr key={trainee._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{trainee.fullName}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">@{trainee.username}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">{trainee.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {trainee.department}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-gray-600">
                                {new Date(trainee.signupDate).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No trainees found matching your search</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Send Notifications</CardTitle>
              <CardDescription>Send updates and announcements to trainers and trainees</CardDescription>
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

              <div>
                <Label htmlFor="notificationDept">Target Department</Label>
                <Select value={selectedNotificationDepartment} onValueChange={setSelectedNotificationDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department (leave empty for all)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={sendNotification} className="w-full" disabled={loading}>
                <Bell className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
