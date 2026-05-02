// Main Vue App Setup
import { auth, onAuthStateChanged } from './firebase-config.js';
import * as FirebaseService from './firebase-service.js';
import * as utils from './utils.js';

const { createApp, ref, computed } = Vue;

export function createMainApp() {
  return createApp({
    setup() {
      // ========== AUTH STATE ==========
      const screen = ref('auth');
      const authTab = ref('login');
      const loading = ref(false);
      const authError = ref('');
      const teacher = ref({ name: '', email: '', subject: '' });
      const loginEmail = ref('');
      const loginPassword = ref('');
      const regName = ref('');
      const regEmail = ref('');
      const regPassword = ref('');
      const regSubject = ref('');

      // ========== DASHBOARD STATE ==========
      const activeTab = ref('overview');
      const tabs = [
        { id: 'overview', icon: '🏠', label: 'Overview' },
        { id: 'classes', icon: '📚', label: 'Classes' },
        { id: 'events', icon: '📋', label: 'Events' },
        { id: 'templates', icon: '📦', label: 'Templates' },
        { id: 'history', icon: '🕐', label: 'History' },
        { id: 'reports', icon: '📊', label: 'Reports' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
      ];

      // ========== CLASSES ==========
      const classes = ref([]);
      const showAddClass = ref(false);
      const newClass = ref({ name: '', section: '', schoolYear: '2024-2025' });
      const selectedClass = ref(null);
      const classStudents = ref([]);
      const newStudentName = ref('');

      // ========== EVENTS ==========
      const events = ref([]);
      const showAddEvent = ref(false);
      const showTemplateLibrary = ref(false);
      const defaultQuestions = ref([]);
      const newEvent = ref({
        question: '',
        category: 'waste',
        hasMiniGame: false,
        choices: [
          { text: '', effect: 'good' },
          { text: '', effect: 'bad' },
          { text: '', effect: 'neutral' },
          { text: '', effect: 'bad' }
        ]
      });

      // ========== SESSIONS ==========
      const quickClass = ref('');
      const activeSession = ref(null);
      const activeScenario = ref(-1);
      const sessionStudents = ref([]);
      const sessionLoading = ref(false);
      const sessions = ref([]);

      // ========== TEMPLATES ==========
      const templates = ref([]);
      const showAddTemplate = ref(false);
      const newTemplate = ref({ name: '', description: '', isPublic: false, accessCode: '', events: [] });

      // ========== REPORTS ==========
      const reportClass = ref('');
      const reportStudents = ref([]);

      // ========== COMPUTED ==========
      const stats = computed(() => [
        { icon: '📚', value: classes.value.length, label: 'Classes' },
        { icon: '👥', value: classes.value.reduce((a, c) => a + (c.studentCount || 0), 0), label: 'Students' },
        { icon: '🎮', value: sessions.value.length, label: 'Sessions' },
        { icon: '📋', value: events.value.length, label: 'Events' },
      ]);

      // ========== AUTH METHODS ==========
      async function login() {
        if (!loginEmail.value || !loginPassword.value) {
          authError.value = 'Please fill in all fields.';
          return;
        }
        loading.value = true;
        authError.value = '';
        try {
          await FirebaseService.loginTeacher(loginEmail.value, loginPassword.value);
        } catch (e) {
          authError.value = 'Invalid email or password.';
        } finally {
          loading.value = false;
        }
      }

      async function register() {
        if (!regName.value || !regEmail.value || !regPassword.value) {
          authError.value = 'Please fill in all fields.';
          return;
        }
        loading.value = true;
        authError.value = '';
        try {
          await FirebaseService.registerTeacher(regName.value, regEmail.value, regPassword.value, regSubject.value);
        } catch (e) {
          authError.value = e.code === 'auth/email-already-in-use' ? 'Email already registered.' : 'Registration failed.';
        } finally {
          loading.value = false;
        }
      }

      async function logout() {
        await FirebaseService.logoutTeacher();
      }

      // ========== LOAD DATA ==========
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const data = await FirebaseService.getTeacherData(user.uid);
          if (data) {
            teacher.value = data;
            screen.value = 'dashboard';
            await loadAll(user.uid);
            await refreshTemplateLibrary(user.uid);
          }
        } else {
          screen.value = 'auth';
        }
      });

      async function loadAll(uid) {
        await Promise.all([
          loadClasses(uid),
          loadEvents(uid),
          loadTemplates(uid),
          loadSessions(uid)
        ]);
      }

      // ========== CLASSES METHODS ==========
      async function loadClasses(uid) {
        classes.value = await FirebaseService.loadClasses(uid);
      }

      async function addClass() {
        if (!newClass.value.name || !newClass.value.section) return;
        await FirebaseService.addClass(newClass.value, auth.currentUser.uid);
        newClass.value = { name: '', section: '', schoolYear: '2024-2025' };
        showAddClass.value = false;
        await loadClasses(auth.currentUser.uid);
      }

      async function deleteClass(id) {
        if (!confirm('Delete this class?')) return;
        await FirebaseService.deleteClass(id);
        await loadClasses(auth.currentUser.uid);
      }

      async function openClass(c) {
        selectedClass.value = c;
        classStudents.value = await FirebaseService.getClassStudents(c.id);
      }

      async function addStudent() {
        if (!newStudentName.value || !selectedClass.value) return;
        await FirebaseService.addStudent(newStudentName.value, selectedClass.value.id, auth.currentUser.uid);
        newStudentName.value = '';
        await openClass(selectedClass.value);
        await FirebaseService.updateClassStudentCount(selectedClass.value.id, classStudents.value.length);
        await loadClasses(auth.currentUser.uid);
      }

      async function deleteStudent(id) {
        await FirebaseService.deleteStudent(id);
        await openClass(selectedClass.value);
        await FirebaseService.updateClassStudentCount(selectedClass.value.id, classStudents.value.length);
        await loadClasses(auth.currentUser.uid);
      }

      // ========== EVENTS METHODS ==========
      async function loadEvents(uid) {
        events.value = await FirebaseService.loadEvents(uid);
      }

      async function addEvent() {
        if (!newEvent.value.question) return;
        await FirebaseService.addEvent(newEvent.value, auth.currentUser.uid);
        newEvent.value = {
          question: '',
          category: 'waste',
          hasMiniGame: false,
          choices: [
            { text: '', effect: 'good' },
            { text: '', effect: 'bad' },
            { text: '', effect: 'neutral' },
            { text: '', effect: 'bad' }
          ]
        };
        showAddEvent.value = false;
        await loadEvents(auth.currentUser.uid);
        await refreshTemplateLibrary(auth.currentUser.uid);
      }

      async function deleteEvent(id) {
        if (!confirm('Delete this event?')) return;
        await FirebaseService.deleteEvent(id);
        await loadEvents(auth.currentUser.uid);
        await refreshTemplateLibrary(auth.currentUser.uid);
      }

      // ========== TEMPLATES METHODS ==========
      async function loadTemplates(uid) {
        templates.value = await FirebaseService.loadTemplates(uid);
      }

      async function refreshTemplateLibrary(uid) {
        try {
          defaultQuestions.value = await FirebaseService.loadEvents(uid);
          console.log('✅ Template library loaded:', defaultQuestions.value.length, 'events');
        } catch (e) {
          console.error('Failed to load templates:', e);
          try {
            const response = await fetch('./default-questions.json');
            const data = await response.json();
            defaultQuestions.value = data.defaultEvents || [];
          } catch (err) {
            defaultQuestions.value = [];
          }
        }
      }

      async function openTemplateLibrary() {
        showTemplateLibrary.value = true;
        await refreshTemplateLibrary(auth.currentUser.uid);
      }

      function addTemplateToEvents(template) {
        newEvent.value = {
          question: template.question,
          category: template.category,
          hasMiniGame: template.hasMiniGame || false,
          choices: template.choices.map(c => ({ text: c.text, effect: c.effect }))
        };
        showTemplateLibrary.value = false;
        showAddEvent.value = true;
      }

      async function addTemplate() {
        if (!newTemplate.value.name || newTemplate.value.events.length === 0) {
          alert('Template name and at least one event required.');
          return;
        }
        await FirebaseService.addTemplate(newTemplate.value, auth.currentUser.uid);
        newTemplate.value = { name: '', description: '', isPublic: false, accessCode: '', events: [] };
        showAddTemplate.value = false;
        await loadTemplates(auth.currentUser.uid);
      }

      async function deleteTemplate(id) {
        if (!confirm('Delete this template?')) return;
        await FirebaseService.deleteTemplate(id);
        await loadTemplates(auth.currentUser.uid);
      }

      function addEventToTemplate(event) {
        newTemplate.value.events.push({ ...event });
      }

      function removeEventFromTemplate(index) {
        newTemplate.value.events.splice(index, 1);
      }

      // ========== SESSIONS METHODS ==========
      async function loadSessions(uid) {
        sessions.value = await FirebaseService.loadSessions(uid);
      }

      async function createSession() {
        if (!quickClass.value) return;
        sessionLoading.value = true;
        const pin = utils.generatePIN();
        try {
          await FirebaseService.createSession(pin, auth.currentUser.uid, quickClass.value);
          activeSession.value = { id: pin, pin, status: 'waiting' };
          watchSession(pin);
        } finally {
          sessionLoading.value = false;
        }
      }

      function watchSession(pin) {
        FirebaseService.watchSessionStudents(pin, (students) => {
          sessionStudents.value = students;
        });
      }

      async function startGame() {
        if (!activeSession.value) return;
        await FirebaseService.updateSessionStatus(activeSession.value.pin, 'started');
        activeSession.value.status = 'started';
      }

      async function sendScenario(index) {
        if (!activeSession.value) return;
        activeScenario.value = index;
        await FirebaseService.updateSessionScenario(activeSession.value.pin, index);
      }

      async function endSession() {
        if (!activeSession.value) return;
        const topStudents = [...sessionStudents.value]
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 3);
        await FirebaseService.endSession(activeSession.value.pin, sessionStudents.value.length, topStudents);
        activeSession.value = null;
        sessionStudents.value = [];
        activeScenario.value = -1;
        await loadSessions(auth.currentUser.uid);
      }

      // ========== REPORTS METHODS ==========
      async function loadReport() {
        if (!reportClass.value) return;
        reportStudents.value = await FirebaseService.getClassReportStudents(reportClass.value);
      }

      // ========== RETURN ALL ==========
      return {
        // Auth
        screen, authTab, loading, authError, teacher,
        loginEmail, loginPassword, regName, regEmail, regPassword, regSubject,
        login, register, logout,

        // Dashboard
        activeTab, tabs, stats,

        // Classes
        classes, showAddClass, newClass, selectedClass, classStudents, newStudentName,
        addClass, deleteClass, openClass, addStudent, deleteStudent,

        // Events
        events, showAddEvent, showTemplateLibrary, defaultQuestions, newEvent,
        addEvent, deleteEvent, addTemplateToEvents,

        // Templates
        templates, showAddTemplate, newTemplate,
        addTemplate, deleteTemplate, addEventToTemplate, removeEventFromTemplate,

        // Sessions
        quickClass, activeSession, activeScenario, sessionStudents, sessionLoading, sessions,
        createSession, startGame, sendScenario, endSession,

        // Reports
        reportClass, reportStudents, loadReport,

        // Utils
        categoryEmoji: utils.categoryEmoji,
        formatDate: utils.formatDate,
        perfLabel: utils.perfLabel,
        perfColor: utils.perfColor,
        openTemplateLibrary
      };
    }
  });
}
