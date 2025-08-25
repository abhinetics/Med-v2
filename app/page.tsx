//  "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Hospital, Lock, User, Building2 } from "lucide-react"

// export default function LoginPage() {
//   const [selectedRole, setSelectedRole] = useState("")
//   const [selectedDepartment, setSelectedDepartment] = useState("")
//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const [departments, setDepartments] = useState<string[]>([])
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const [showSignup, setShowSignup] = useState(false)
//   const [signupData, setSignupData] = useState({
//     fullName: "",
//     username: "",
//     email: "",
//     password: "",
//     department: "",
//   })

//   useEffect(() => {
//     // Load departments from API
//     fetchDepartments()
//   }, [])

//   // Database initialization is now handled by a separate process

//   const fetchDepartments = async () => {
//     try {
//       const response = await fetch("/api/departments")
//       if (response.ok) {
//         const depts = await response.json()
//         setDepartments(depts.map((d: any) => d.name))
//       }
//     } catch (error) {
//       console.error("Error fetching departments:", error)
//       // Fallback to default departments
//       setDepartments(["Department 1", "Department 2", "Department 3"])
//     }
//   }

//   const handleLogin = async () => {
//     if (!selectedRole) {
//       setError("Please select a role")
//       return
//     }

//     if (!username.trim() || !password.trim()) {
//       setError("Please enter username and password")
//       return
//     }

//     if (selectedRole === "trainee" && !selectedDepartment) {
//       setError("Please select department")
//       return
//     }

//     setLoading(true)
//     setError("")

//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           role: selectedRole,
//           username: username.trim(),
//           password: password.trim(),
//           department: selectedDepartment,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok && data.success) {
//         // Store user data in localStorage
//         localStorage.setItem("userRole", selectedRole)
//         localStorage.setItem("isAuthenticated", "true")

//         if (selectedRole === "admin") {
//           router.push("/admin")
//         } else if (selectedRole === "trainer") {
//           localStorage.setItem("trainerDepartment", data.user.department)
//           localStorage.setItem("trainerName", data.user.name)
//           localStorage.setItem("trainerUsername", data.user.username)
//           localStorage.setItem("trainerId", data.user.id)
//           router.push("/trainer")
//         } else if (selectedRole === "trainee") {
//           localStorage.setItem("traineeDepartment", data.user.department)
//           localStorage.setItem("traineeEmail", data.user.email)
//           localStorage.setItem("traineeName", data.user.fullName)
//           localStorage.setItem("traineeUsername", data.user.username)
//           localStorage.setItem("traineeId", data.user.id)
//           router.push("/trainee")
//         }
//       } else {
//         setError(data.error || "Login failed")
//       }
//     } catch (error) {
//       console.error("Login error:", error)
//       setError("Network error. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSignup = async () => {
//     if (
//       !signupData.fullName.trim() ||
//       !signupData.username.trim() ||
//       !signupData.email.trim() ||
//       !signupData.password.trim() ||
//       !signupData.department
//     ) {
//       setError("Please fill all fields")
//       return
//     }

//     setLoading(true)
//     setError("")

//     try {
//       const response = await fetch("/api/trainees", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(signupData),
//       })

//       const data = await response.json()

//       if (response.ok && data.success) {
//         alert("Signup successful! You can now login with your username.")
//         setShowSignup(false)
//         setSignupData({ fullName: "", username: "", email: "", password: "", department: "" })
//       } else {
//         setError(data.error || "Signup failed")
//       }
//     } catch (error) {
//       console.error("Signup error:", error)
//       setError("Network error. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (showSignup) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className="flex justify-center mb-4">
//               <div className="bg-blue-100 p-3 rounded-full">
//                 <Hospital className="h-8 w-8 text-blue-600" />
//               </div>
//             </div>
//             <CardTitle className="text-xl font-bold text-gray-800">Trainee Signup</CardTitle>
//             <CardDescription>Create your trainee account</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="fullName">Full Name</Label>
//               <Input
//                 id="fullName"
//                 placeholder="Enter your full name"
//                 value={signupData.fullName}
//                 onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="signupUsername">Username</Label>
//               <Input
//                 id="signupUsername"
//                 placeholder="Choose a username"
//                 value={signupData.username}
//                 onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email ID</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={signupData.email}
//                 onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="signupDepartment">Department</Label>
//               <Select
//                 value={signupData.department}
//                 onValueChange={(value) => setSignupData({ ...signupData, department: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select your department" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {departments.map((dept) => (
//                     <SelectItem key={dept} value={dept}>
//                       <div className="flex items-center gap-2">
//                         <Building2 className="h-4 w-4" />
//                         {dept}
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="signupPassword">Password</Label>
//               <Input
//                 id="signupPassword"
//                 type="password"
//                 placeholder="Create a password"
//                 value={signupData.password}
//                 onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
//               />
//             </div>

//             {error && <div className="text-red-500 text-sm text-center">{error}</div>}

//             <div className="flex gap-2">
//               <Button onClick={handleSignup} className="flex-1" disabled={loading}>
//                 {loading ? "Signing up..." : "Sign Up"}
//               </Button>
//               <Button variant="outline" onClick={() => setShowSignup(false)} className="flex-1">
//                 Cancel
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="bg-blue-100 p-3 rounded-full">
//               <Hospital className="h-8 w-8 text-blue-600" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold text-gray-800">MedTrain System</CardTitle>
//           <CardDescription>Hospital Learning Management System</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="role">Select Role</Label>
//             <Select
//               value={selectedRole}
//               onValueChange={(value) => {
//                 setSelectedRole(value)
//                 setSelectedDepartment("")
//                 setUsername("")
//                 setPassword("")
//                 setError("")
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Choose your role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="admin">
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4" />
//                     Admin
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="trainer">
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4" />
//                     Trainer
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="trainee">
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4" />
//                     Trainee
//                   </div>
//                 </SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {selectedRole === "trainee" && (
//             <div className="space-y-2">
//               <Label htmlFor="department">Select Department</Label>
//               <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choose your department" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {departments.map((dept) => (
//                     <SelectItem key={dept} value={dept}>
//                       <div className="flex items-center gap-2">
//                         <Building2 className="h-4 w-4" />
//                         {dept}
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="username">Username</Label>
//             <div className="relative">
//               <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 id="username"
//                 placeholder="Enter username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="pl-10"
//                 onKeyPress={(e) => e.key === "Enter" && handleLogin()}
//               />
//             </div>
//           </div>

//           {error && <div className="text-red-500 text-sm text-center">{error}</div>}

//           <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </Button>

//           <div className="text-center">
//             <Button variant="link" onClick={() => setShowSignup(true)} className="text-blue-600">
//               Trainee Signup
//             </Button>
//           </div>

//           <div className="text-xs text-gray-500 text-center space-y-1">
//             <div>Demo Credentials:</div>
//             <div>Admin: username: admin, password: admin123</div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Hospital, Lock, User, Building2, Shield, Users, GraduationCap, Heart, Activity, Stethoscope } from "lucide-react"
// import medicalHero from "@/assets/medical-hero.jpg"
const medicalHero = "/assets/medical-hero.jpg"
// const medicalHero = "https://images.unsplash.com/photo-1588776814546-2d1bcd64a7f8?w=1600&h=900&fit=crop";


export default function MedicalLogin() {
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [showSignup, setShowSignup] = useState(false)
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    department: "",
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const depts = await response.json()
        setDepartments(depts.map((d: any) => d.name))
      } else {
        throw new Error("Failed to fetch departments")
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments(["Department 1", "Department 2", "Department 3"])
    }
  }

  const handleLogin = async () => {
    if (!selectedRole) {
      setError("Please select a role")
      return
    }

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password")
      return
    }

    if (selectedRole === "trainee" && !selectedDepartment) {
      setError("Please select department")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          username: username.trim(),
          password: password.trim(),
          department: selectedDepartment,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("userRole", selectedRole)
        localStorage.setItem("isAuthenticated", "true")

        if (selectedRole === "admin") {
          router.push("/admin")
        } else if (selectedRole === "trainer") {
          localStorage.setItem("trainerDepartment", data.user.department)
          localStorage.setItem("trainerName", data.user.name)
          localStorage.setItem("trainerUsername", data.user.username)
          localStorage.setItem("trainerId", data.user.id)
          router.push("/trainer")
        } else if (selectedRole === "trainee") {
          localStorage.setItem("traineeDepartment", data.user.department)
          localStorage.setItem("traineeEmail", data.user.email)
          localStorage.setItem("traineeName", data.user.fullName)
          localStorage.setItem("traineeUsername", data.user.username)
          localStorage.setItem("traineeId", data.user.id)
          router.push("/trainee")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (
      !signupData.fullName.trim() ||
      !signupData.username.trim() ||
      !signupData.email.trim() ||
      !signupData.password.trim() ||
      !signupData.department
    ) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/trainees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert("Signup successful! You can now login with your username.")
        setShowSignup(false)
        setSignupData({ fullName: "", username: "", email: "", password: "", department: "" })
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-5 w-5" />
      case "trainer": return <Users className="h-5 w-5" />
      case "trainee": return <GraduationCap className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800"
      case "trainer": return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800"
      case "trainee": return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800"
      default: return ""
    }
  }

  if (showSignup) {
    return (
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(217_78%_51%/_0.1)_0%,transparent_50%)] animate-pulse-soft" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(142_69%_58%/_0.1)_0%,transparent_50%)]" />
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-card/95 backdrop-blur-xl animate-fade-up">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-medical rounded-2xl blur-xl opacity-30 animate-pulse-soft" />
                  <div className="relative bg-gradient-medical p-4 rounded-2xl shadow-lg">
                    <GraduationCap className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold bg-gradient-medical bg-clip-text text-transparent">
                  Join MedTrain
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Create your trainee account to begin your medical training journey
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupUsername" className="text-sm font-medium text-foreground">Username</Label>
                  <Input
                    id="signupUsername"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email ID</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupDepartment" className="text-sm font-medium text-foreground">Department</Label>
                  <Select
                    value={signupData.department}
                    onValueChange={(value) => setSignupData({ ...signupData, department: value })}
                  >
                    <SelectTrigger className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/60 shadow-lg">
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept} className="hover:bg-muted/50 focus:bg-muted/50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="font-medium">{dept}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-sm font-medium text-foreground">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Create a secure password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm text-center animate-fade-up font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  onClick={handleSignup} 
                  variant="medical" 
                  className="flex-1 h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <Button 
                  variant="medical-outline" 
                  onClick={() => setShowSignup(false)} 
                  className="flex-1 h-12 font-semibold"
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(217_78%_51%/_0.08)_0%,transparent_50%)] animate-pulse-soft" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(142_69%_58%/_0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,hsl(217_78%_51%/_0.02)_50%,transparent_100%)]" />
      </div>

      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03]"
        style={{ backgroundImage: `url(${medicalHero})` }}
      />
      
      <div className="lg:hidden relative z-10 p-6 pt-12">
        <div className="flex items-center justify-center gap-4 animate-fade-up">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-medical rounded-2xl blur-lg opacity-40 animate-pulse-soft" />
            <div className="relative bg-gradient-medical p-3 rounded-2xl shadow-lg">
              <Hospital className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-medical bg-clip-text text-transparent">
              MedTrain
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Learning Management System</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
          <div className="max-w-lg space-y-8 animate-fade-up">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-medical rounded-3xl blur-2xl opacity-40 animate-pulse-soft" />
                  <div className="relative bg-gradient-medical p-4 rounded-3xl shadow-xl hover-scale transition-smooth">
                    <Hospital className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-medical bg-clip-text text-transparent">
                    MedTrain
                  </h1>
                  <p className="text-base text-muted-foreground font-medium mt-1">Learning Management System</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground leading-tight">
                  Advanced Medical Training Platform
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Empowering healthcare professionals with comprehensive training, 
                  assessment tools, and collaborative learning experiences.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-border/40 text-center hover-scale transition-smooth group shadow-sm">
                <Heart className="h-9 w-9 text-primary mx-auto mb-3 group-hover:animate-bounce-gentle transition-all duration-300" />
                <p className="text-sm font-semibold text-foreground">Patient Care</p>
                <p className="text-xs text-muted-foreground mt-1">Focused care</p>
              </div>
              <div className="bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-border/40 text-center hover-scale transition-smooth group shadow-sm">
                <Stethoscope className="h-9 w-9 text-accent mx-auto mb-3 group-hover:animate-bounce-gentle transition-all duration-300" />
                <p className="text-sm font-semibold text-foreground">Clinical Skills</p>
                <p className="text-xs text-muted-foreground mt-1">Expert training</p>
              </div>
              <div className="bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-border/40 text-center hover-scale transition-smooth group shadow-sm">
                <Activity className="h-9 w-9 text-medical-success mx-auto mb-3 group-hover:animate-bounce-gentle transition-all duration-300" />
                <p className="text-sm font-semibold text-foreground">Progress Tracking</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 lg:max-w-2xl">
          <Card className="w-full max-w-md mx-auto border-0 shadow-xl bg-card/95 backdrop-blur-xl animate-fade-up">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Sign in to access your medical training dashboard
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-foreground">Select Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => {
                      setSelectedRole(value)
                      setSelectedDepartment("")
                      setUsername("")
                      setPassword("")
                      setError("")
                    }}
                  >
                    <SelectTrigger className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-primary/40 transition-all duration-300">
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border-border/60 shadow-xl">
                      <SelectItem value="admin" className="hover:bg-muted/60 cursor-pointer transition-all duration-200 focus:bg-muted/60 py-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="font-semibold">Administrator</div>
                            <div className="text-xs text-muted-foreground">System management & oversight</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="trainer" className="hover:bg-muted/60 cursor-pointer transition-all duration-200 focus:bg-muted/60 py-3">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-semibold">Trainer</div>
                            <div className="text-xs text-muted-foreground">Course instructor & mentor</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="trainee" className="hover:bg-muted/60 cursor-pointer transition-all duration-200 focus:bg-muted/60 py-3">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-semibold">Trainee</div>
                            <div className="text-xs text-muted-foreground">Medical student & learner</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole && (
                  <div className="flex justify-center animate-fade-up">
                    <Badge className={`${getRoleColor(selectedRole)} border px-4 py-2 font-medium shadow-sm`}>
                      {getRoleIcon(selectedRole)}
                      <span className="ml-2 capitalize">{selectedRole}</span>
                    </Badge>
                  </div>
                )}

                {selectedRole === "trainee" && (
                  <div className="space-y-2 animate-fade-up">
                    <Label htmlFor="department" className="text-sm font-medium text-foreground">Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300">
                        <SelectValue placeholder="Choose your department" />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-border/60 shadow-lg">
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept} className="hover:bg-muted/50 focus:bg-muted/50 cursor-pointer py-2">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">{dept}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-11 h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                      onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm text-center animate-fade-up font-medium">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleLogin} 
                variant="medical" 
                className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center space-y-4">
                <Button 
                  variant="link" 
                  onClick={() => setShowSignup(true)} 
                  className="text-primary font-semibold hover:text-primary-hover transition-colors duration-200"
                >
                  New Trainee? Create Account
                </Button>
                
                <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-2 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">Demo Credentials:</div>
                  <div className="space-y-1">
                    <div>Username: <span className="font-mono bg-background/80 px-2 py-1 rounded text-foreground font-semibold">admin</span></div>
                    <div>Password: <span className="font-mono bg-background/80 px-2 py-1 rounded text-foreground font-semibold">admin123</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}