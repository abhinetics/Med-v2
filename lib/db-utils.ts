import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export async function getDatabase() {
  const client = await clientPromise
  return client.db("hospitalLMS")
}

// User Management
export async function createUser(userData: any) {
  const db = await getDatabase()
  const result = await db.collection("users").insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result
}

export async function findUser(query: any) {
  const db = await getDatabase()
  return await db.collection("users").findOne(query)
}

export async function updateUser(id: string, updateData: any) {
  const db = await getDatabase()
  return await db
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, updatedAt: new Date() } })
}

// Department Management
export async function createDepartment(departmentData: any) {
  const db = await getDatabase()
  return await db.collection("departments").insertOne({
    ...departmentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getAllDepartments() {
  const db = await getDatabase()
  return await db.collection("departments").find({}).toArray()
}

// Trainer Management
export async function createTrainer(trainerData: any) {
  const db = await getDatabase()
  return await db.collection("trainers").insertOne({
    ...trainerData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getAllTrainers() {
  const db = await getDatabase()
  return await db.collection("trainers").find({}).toArray()
}

export async function deleteTrainer(id: string) {
  const db = await getDatabase()
  return await db.collection("trainers").deleteOne({ _id: new ObjectId(id) })
}

// Trainee Management
export async function createTrainee(traineeData: any) {
  const db = await getDatabase()
  return await db.collection("trainees").insertOne({
    ...traineeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getAllTrainees() {
  const db = await getDatabase()
  return await db.collection("trainees").find({}).toArray()
}

export async function findTrainee(query: any) {
  const db = await getDatabase()
  return await db.collection("trainees").findOne(query)
}

// Chapter Management
export async function createChapter(chapterData: any) {
  const db = await getDatabase()
  return await db.collection("chapters").insertOne({
    ...chapterData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getChaptersByDepartment(department: string) {
  const db = await getDatabase()
  return await db.collection("chapters").find({ department }).toArray()
}

export async function updateChapter(id: string, updateData: any) {
  const db = await getDatabase()
  return await db
    .collection("chapters")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, updatedAt: new Date() } })
}

export async function deleteChapter(id: string) {
  const db = await getDatabase()
  return await db.collection("chapters").deleteOne({ _id: new ObjectId(id) })
}

// Notification Management
export async function createNotification(notificationData: any) {
  const db = await getDatabase()
  return await db.collection("notifications").insertOne({
    ...notificationData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getNotificationsByDepartment(department: string) {
  const db = await getDatabase()
  return await db
    .collection("notifications")
    .find({
      $or: [{ department }, { department: "all" }],
    })
    .sort({ createdAt: -1 })
    .toArray()
}

// Meeting Management
export async function createMeeting(meetingData: any) {
  const db = await getDatabase()
  return await db.collection("meetings").insertOne({
    ...meetingData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getMeetingsByDepartment(department: string) {
  const db = await getDatabase()
  return await db.collection("meetings").find({ department }).toArray()
}

export async function updateMeeting(id: string, updateData: any) {
  const db = await getDatabase()
  return await db
    .collection("meetings")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, updatedAt: new Date() } })
}

// Progress Management
export async function saveTraineeProgress(progressData: any) {
  const db = await getDatabase()
  return await db
    .collection("traineeProgress")
    .replaceOne(
      { traineeId: progressData.traineeId, department: progressData.department },
      { ...progressData, updatedAt: new Date() },
      { upsert: true },
    )
}

export async function getTraineeProgress(traineeId: string, department: string) {
  const db = await getDatabase()
  return await db.collection("traineeProgress").findOne({ traineeId, department })
}

// Attendance Management
export async function saveAttendanceRecord(attendanceData: any) {
  const db = await getDatabase()
  return await db.collection("attendance").insertOne({
    ...attendanceData,
    createdAt: new Date(),
  })
}

export async function getAttendanceRecords(department: string) {
  const db = await getDatabase()
  return await db.collection("attendance").find({ department }).toArray()
}
