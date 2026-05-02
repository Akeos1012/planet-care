// Firebase Service - Handles all database operations
import { auth, db, rtdb, doc, setDoc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp, dbRef, set, onValue } from './firebase-config.js';

// ========== AUTH ==========
export async function loginTeacher(email, password) {
  const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerTeacher(name, email, password, subject) {
  const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'teachers', cred.user.uid), {
    name, email, subject,
    school: 'AMA Computer College East Rizal',
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function logoutTeacher() {
  const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
  return signOut(auth);
}

export async function getTeacherData(uid) {
  const snap = await getDoc(doc(db, 'teachers', uid));
  return snap.exists() ? snap.data() : null;
}

// ========== CLASSES ==========
export async function loadClasses(teacherId) {
  const snap = await getDocs(query(collection(db, 'classes'), where('teacherId', '==', teacherId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addClass(classData, teacherId) {
  return await addDoc(collection(db, 'classes'), {
    ...classData,
    teacherId,
    studentCount: 0,
    createdAt: serverTimestamp()
  });
}

export async function deleteClass(classId) {
  await deleteDoc(doc(db, 'classes', classId));
}

export async function updateClassStudentCount(classId, count) {
  await updateDoc(doc(db, 'classes', classId), { studentCount: count });
}

// ========== STUDENTS ==========
export async function getClassStudents(classId) {
  const snap = await getDocs(query(collection(db, 'students'), where('classId', '==', classId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addStudent(name, classId, teacherId) {
  return await addDoc(collection(db, 'students'), {
    name, classId, teacherId,
    totalScore: 0,
    sessionCount: 0,
    createdAt: serverTimestamp()
  });
}

export async function deleteStudent(studentId) {
  await deleteDoc(doc(db, 'students', studentId));
}

// ========== EVENTS ==========
export async function loadEvents(teacherId) {
  const snap = await getDocs(query(collection(db, 'events'), where('teacherId', '==', teacherId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addEvent(eventData, teacherId) {
  return await addDoc(collection(db, 'events'), {
    ...eventData,
    teacherId,
    createdAt: serverTimestamp()
  });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId));
}

// ========== TEMPLATES ==========
export async function loadTemplates(teacherId) {
  const snap = await getDocs(query(collection(db, 'templates'), where('teacherId', '==', teacherId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addTemplate(templateData, teacherId) {
  return await addDoc(collection(db, 'templates'), {
    ...templateData,
    teacherId,
    eventCount: templateData.events.length,
    createdAt: serverTimestamp()
  });
}

export async function deleteTemplate(templateId) {
  await deleteDoc(doc(db, 'templates', templateId));
}

// ========== SESSIONS ==========
export async function loadSessions(teacherId) {
  const snap = await getDocs(query(collection(db, 'sessions'), where('teacherId', '==', teacherId)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function createSession(pin, teacherId, classId) {
  const sessionRef = doc(db, 'sessions', pin);
  await setDoc(sessionRef, {
    pin,
    teacherId,
    classId,
    status: 'waiting',
    current_scenario: 0,
    studentCount: 0,
    createdAt: serverTimestamp(),
    templateId: 'default'
  });
  
  await set(dbRef(rtdb, `sessions/${pin}`), {
    status: 'waiting',
    current_scenario: 0,
    pin,
    sessionId: pin,
    templateId: 'default'
  });
}

export async function updateSessionStatus(pin, status) {
  await set(dbRef(rtdb, `sessions/${pin}/status`), status);
  await updateDoc(doc(db, 'sessions', pin), { status });
}

export async function updateSessionScenario(pin, scenarioIndex) {
  await set(dbRef(rtdb, `sessions/${pin}/current_scenario`), scenarioIndex);
  await updateDoc(doc(db, 'sessions', pin), { current_scenario: scenarioIndex });
}

export async function endSession(pin, studentCount, topStudents) {
  await set(dbRef(rtdb, `sessions/${pin}/status`), 'ended');
  await updateDoc(doc(db, 'sessions', pin), {
    status: 'ended',
    studentCount,
    topStudents
  });
}

export function watchSessionStudents(pin, callback) {
  onValue(dbRef(rtdb, `sessions/${pin}/students`), (snap) => {
    const data = snap.val();
    callback(data ? Object.entries(data).map(([id, v]) => ({ id, ...v })) : []);
  });
}

// ========== REPORTS ==========
export async function getClassReportStudents(classId) {
  const snap = await getDocs(query(collection(db, 'students'), where('classId', '==', classId)));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      avgScore: data.sessionCount > 0 ? Math.round(data.totalScore / data.sessionCount) : 0
    };
  });
}

export { auth };
