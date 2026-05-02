# 🔌 PlanetCare API Reference

This document outlines the data structures and API patterns used in PlanetCare.

---

## 📡 Firebase Realtime Database API

The RTDB is used exclusively for live, session-specific data.

### Path Structure
```
sessions/{PIN}/
  ├── status: "waiting" | "started" | "ended"
  ├── current_scenario: number (-1 if none)
  ├── pin: string
  ├── sessionId: string (reference to Firestore)
  └── students/
      └── {studentId}/
          ├── name: string
          ├── score: number
          └── answer: string (latest choice)
```

### Read Operations

#### Get Current Session Status
```javascript
const pin = "852146";
const status = await database.ref(`sessions/${pin}/status`).once('value');
console.log(status.val()); // "waiting" | "started" | "ended"
```

#### Get All Joined Students
```javascript
const students = await database.ref(`sessions/${pin}/students`).once('value');
const studentList = students.val(); // { studentId: {name, score, answer}, ... }
```

#### Get Current Scenario Index
```javascript
const scenario = await database.ref(`sessions/${pin}/current_scenario`).once('value');
console.log(scenario.val()); // 0, 1, 2, ... or -1
```

#### Get Single Student Data
```javascript
const student = await database.ref(`sessions/${pin}/students/${studentId}`).once('value');
console.log(student.val()); // { name, score, answer }
```

### Write Operations

#### Create New Session in RTDB
```javascript
const pin = "852146";
await database.ref(`sessions/${pin}`).set({
  status: "waiting",
  current_scenario: -1,
  pin: pin,
  sessionId: "firestore-session-id"
});
```

#### Update Session Status
```javascript
await database.ref(`sessions/${pin}/status`).set("started");
// or
await database.ref(`sessions/${pin}/status`).set("ended");
```

#### Send Scenario Index
```javascript
const scenarioIndex = 2;
await database.ref(`sessions/${pin}/current_scenario`).set(scenarioIndex);
```

#### Student Joins Session (from Godot)
```javascript
const studentId = "student-uid-123";
await database.ref(`sessions/${pin}/students/${studentId}`).set({
  name: "Juan",
  score: 0,
  answer: ""
});
```

#### Student Submits Answer
```javascript
await database.ref(`sessions/${pin}/students/${studentId}/answer`).set("Choice A");
```

#### Update Student Score
```javascript
await database.ref(`sessions/${pin}/students/${studentId}/score`).set(25);
```

### Listen Operations

#### Listen to Student Join/Leave
```javascript
database.ref(`sessions/${pin}/students`).on('value', (snap) => {
  const students = snap.val();
  // Re-render leaderboard
  console.log(students);
});
```

#### Listen to Scenario Change
```javascript
database.ref(`sessions/${pin}/current_scenario`).on('value', (snap) => {
  const scenarioIndex = snap.val();
  // Display new question
  console.log(`Now showing question ${scenarioIndex}`);
});
```

#### Listen to Status Change
```javascript
database.ref(`sessions/${pin}/status`).on('value', (snap) => {
  const status = snap.val();
  if (status === "started") {
    console.log("Game started!");
  } else if (status === "ended") {
    console.log("Game ended!");
  }
});
```

---

## 📚 Firestore Database API

Firestore stores permanent, teacher-owned data.

### Collection: `teachers/{userId}`

#### Create Teacher Profile
```javascript
await setDoc(doc(db, 'teachers', userId), {
  name: "Ms. Santos",
  email: "ms.santos@school.edu",
  subject: "Science - Grade 5",
  school: "AMA Computer College",
  createdAt: serverTimestamp()
});
```

#### Read Teacher Profile
```javascript
const snap = await getDoc(doc(db, 'teachers', userId));
const teacherData = snap.data();
```

#### Update Teacher Profile
```javascript
await updateDoc(doc(db, 'teachers', userId), {
  subject: "Biology - Grade 6"
});
```

---

### Collection: `classes/{classId}`

#### Create Class
```javascript
const classRef = await addDoc(collection(db, 'classes'), {
  teacherId: currentUserId,
  name: "Biology 101",
  section: "Matiyaga",
  schoolYear: "2024-2025",
  studentCount: 0,
  createdAt: serverTimestamp()
});
const classId = classRef.id;
```

#### List Teacher's Classes
```javascript
const q = query(
  collection(db, 'classes'),
  where('teacherId', '==', currentUserId)
);
const snap = await getDocs(q);
const classes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Get Single Class
```javascript
const snap = await getDoc(doc(db, 'classes', classId));
const classData = snap.data();
```

#### Update Class
```javascript
await updateDoc(doc(db, 'classes', classId), {
  name: "Advanced Biology",
  studentCount: 35
});
```

#### Delete Class
```javascript
await deleteDoc(doc(db, 'classes', classId));
```

---

### Collection: `students/{studentId}`

#### Add Student to Class
```javascript
const studentRef = await addDoc(collection(db, 'students'), {
  teacherId: currentUserId,
  classId: classId,
  name: "Juan Dela Cruz",
  totalScore: 0,
  sessionCount: 0,
  createdAt: serverTimestamp()
});
```

#### List Class Students
```javascript
const q = query(
  collection(db, 'students'),
  where('classId', '==', classId)
);
const snap = await getDocs(q);
const students = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Update Student Scores (After Session)
```javascript
const studentRef = doc(db, 'students', studentId);
const snap = await getDoc(studentRef);
const current = snap.data();

await updateDoc(studentRef, {
  totalScore: (current.totalScore || 0) + sessionScore,
  sessionCount: (current.sessionCount || 0) + 1
});
```

#### Delete Student
```javascript
await deleteDoc(doc(db, 'students', studentId));
```

---

### Collection: `events/{eventId}`

#### Create Event
```javascript
const eventRef = await addDoc(collection(db, 'events'), {
  teacherId: currentUserId,
  question: "You see trash. What do you do?",
  category: "waste",
  hasMiniGame: false,
  choices: [
    { text: "Recycle it", effect: "good" },
    { text: "Litter it", effect: "bad" },
    { text: "Leave it", effect: "neutral" },
    { text: "Reuse it", effect: "good" }
  ],
  createdAt: serverTimestamp()
});
```

#### List Teacher's Events
```javascript
const q = query(
  collection(db, 'events'),
  where('teacherId', '==', currentUserId)
);
const snap = await getDocs(q);
const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Get Single Event
```javascript
const snap = await getDoc(doc(db, 'events', eventId));
const event = snap.data();
```

#### Update Event
```javascript
await updateDoc(doc(db, 'events', eventId), {
  question: "Updated question text",
  choices: [/* ... */]
});
```

#### Delete Event
```javascript
await deleteDoc(doc(db, 'events', eventId));
```

---

### Collection: `templates/{templateId}`

#### Create Template
```javascript
const templateRef = await addDoc(collection(db, 'templates'), {
  teacherId: currentUserId,
  name: "Climate Basics",
  description: "Introduction to climate change",
  isPublic: true,
  accessCode: "", // optional
  events: [/* array of event objects */],
  eventCount: 5,
  createdAt: serverTimestamp()
});
```

#### List Teacher's Templates
```javascript
const q = query(
  collection(db, 'templates'),
  where('teacherId', '==', currentUserId)
);
const snap = await getDocs(q);
const templates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### List Public Templates
```javascript
const q = query(
  collection(db, 'templates'),
  where('isPublic', '==', true)
);
const snap = await getDocs(q);
const publicTemplates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Get Single Template
```javascript
const snap = await getDoc(doc(db, 'templates', templateId));
const template = snap.data();
```

#### Delete Template
```javascript
await deleteDoc(doc(db, 'templates', templateId));
```

---

### Collection: `sessions/{sessionId}`

#### Create Session Record
```javascript
const sessionRef = await addDoc(collection(db, 'sessions'), {
  teacherId: currentUserId,
  classId: classId,
  pin: "852146",
  status: "waiting",
  current_scenario: -1,
  studentCount: 0,
  createdAt: serverTimestamp()
});
```

#### List Teacher's Sessions
```javascript
const q = query(
  collection(db, 'sessions'),
  where('teacherId', '==', currentUserId),
  orderBy('createdAt', 'desc')
);
const snap = await getDocs(q);
const sessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Update Session (End Session)
```javascript
await updateDoc(doc(db, 'sessions', sessionId), {
  status: "ended",
  studentCount: 25,
  topStudents: [
    { name: "Juan", score: 150 },
    { name: "Maria", score: 145 },
    { name: "Pedro", score: 140 }
  ]
});
```

---

## 🔐 Authentication API

### Sign Up
```javascript
import { createUserWithEmailAndPassword } from "firebase/auth";

await createUserWithEmailAndPassword(auth, email, password);
// Also create teacher profile in Firestore
```

### Sign In
```javascript
import { signInWithEmailAndPassword } from "firebase/auth";

await signInWithEmailAndPassword(auth, email, password);
```

### Sign Out
```javascript
import { signOut } from "firebase/auth";

await signOut(auth);
```

### Get Current User
```javascript
const user = auth.currentUser;
// or
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user.uid, user.email);
  }
});
```

---

## 📊 Query Patterns

### Get Teacher's Full Dashboard

```javascript
async function getDashboard(userId) {
  const [classesSnap, eventsSnap, sessionsSnap, templatesSnap] = await Promise.all([
    getDocs(query(collection(db, 'classes'), where('teacherId', '==', userId))),
    getDocs(query(collection(db, 'events'), where('teacherId', '==', userId))),
    getDocs(query(collection(db, 'sessions'), where('teacherId', '==', userId))),
    getDocs(query(collection(db, 'templates'), where('teacherId', '==', userId)))
  ]);
  
  return {
    classes: classesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    events: eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    sessions: sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    templates: templatesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  };
}
```

### Get Class Performance Report

```javascript
async function getClassReport(classId) {
  const students = await getDocs(
    query(collection(db, 'students'), where('classId', '==', classId))
  );
  
  return students.docs.map(snap => {
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name,
      totalScore: data.totalScore,
      sessionCount: data.sessionCount,
      avgScore: data.sessionCount > 0 
        ? Math.round(data.totalScore / data.sessionCount)
        : 0
    };
  }).sort((a, b) => b.avgScore - a.avgScore); // Sort by average score
}
```

### Paginated Query

```javascript
async function getClassesPaginated(userId, pageSize = 10, lastDoc = null) {
  let q = query(
    collection(db, 'classes'),
    where('teacherId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(
      collection(db, 'classes'),
      where('teacherId', '==', userId),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }
  
  const snap = await getDocs(q);
  return {
    docs: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1]
  };
}
```

---

## 🎮 Godot Integration Calls

```gdscript
# Join Session
var firebaseDB = FirebaseDatabase.new()
await firebaseDB.child("sessions").child(pin).child("students").child(student_id).set({
  "name": student_name,
  "score": 0,
  "answer": ""
})

# Listen to Scenario Change
firebaseDB.child("sessions").child(pin).child("current_scenario").on("value", func(data):
  current_event = events[data.val()]
  display_event(current_event)
)

# Submit Answer
await firebaseDB.child("sessions").child(pin).child("students").child(student_id).child("answer").set(choice_text)

# Update Score
current_score += points
await firebaseDB.child("sessions").child(pin).child("students").child(student_id).child("score").set(current_score)
```

---

## ⚠️ Error Handling

### Try-Catch Pattern

```javascript
try {
  await addDoc(collection(db, 'events'), eventData);
} catch (error) {
  if (error.code === 'permission-denied') {
    console.log("Not authorized");
  } else if (error.code === 'resource-exhausted') {
    console.log("Quota exceeded");
  } else {
    console.log("Error:", error.message);
  }
}
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `permission-denied` | Security rule violation | Check Firestore rules |
| `resource-exhausted` | Quota exceeded | Upgrade plan or reduce usage |
| `not-found` | Document doesn't exist | Verify ID, recreate |
| `already-exists` | Duplicate document | Delete old or use new ID |
| `deadline-exceeded` | Timeout | Retry with backoff |

---

## 📈 Performance Tips

1. **Use Indexes**: For complex queries, add indexes in Firebase Console
2. **Limit Reads**: Use `where()` and `limit()` to reduce data transfer
3. **Batch Operations**: Use batch writes for multiple updates
4. **Denormalize**: Store computed values to reduce reads
5. **Cache**: Store session participants locally to reduce queries

---

## 🔗 Related Documentation

- [Firebase JS SDK Docs](https://firebase.google.com/docs/reference/js)
- [Firestore Query Reference](https://firebase.google.com/docs/firestore/query-data/queries)
- [RTDB Reference](https://firebase.google.com/docs/reference/js/database)

---

**Last Updated**: April 2026  
**Version**: 1.0
