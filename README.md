# 🌍 PlanetCare Teacher Dashboard

An interactive educational platform that brings climate-change learning to life through engaging mini-games, real-time decision-making scenarios, and live classroom engagement.

## 📋 Vision

**PlanetCare** is a comprehensive educational gaming ecosystem:
- **Teachers** manage classes and control live game sessions via a web dashboard
- **Students** join sessions via unique PINs and play interactive climate-decision games on mobile devices (Godot)
- **Backend** powered by Firebase for real-time collaboration and persistent data storage

---

## 🏗️ Architecture Overview

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web)** | Vue.js 3 + Tailwind CSS |
| **State Management** | Vue Composition API |
| **Backend / BaaS** | Firebase (Auth + Firestore + Realtime Database) |
| **Mobile Game** | Godot Engine (portrait mode, low-poly) |
| **Real-time Communication** | Firebase SDK |

### User Roles & Access

| Role | Access | Platform |
|------|--------|----------|
| **Teacher** | Dashboard, Session Control, Class Management, Analytics | Web Browser |
| **Student** | Game Sessions, Mini-games, Leaderboards | Mobile App (Godot) |
| **System** | Data Storage, Real-time Updates, User Management | Firebase |

---

## 🎯 Features (MVP)

### ✅ Implemented

- **Authentication**: Teacher login/register with email
- **Dashboard**: Quick stats, active session panel
- **Classes**: Full CRUD for class management with student rosters
- **Events**: Create, edit, and delete game questions with 4-choice answers
- **Templates**: Create reusable sets of events (public/private options)
- **Session Control**: Generate PIN, start/pause/end games, live leaderboards
- **Real-time Updates**: Firebase RTDB for live student responses
- **Reports**: Per-class student performance analytics
- **Settings**: Profile info, account management

### 🔄 Coming Soon (Phase 2)

- Public template discovery & sharing
- Advanced analytics with charts & trends
- Mini-game builder (teacher-friendly)
- Session recording & replay
- CSV/PDF export functionality
- Gamification badges & achievement system

---

## 📂 Project Structure

```
planetcare/
├── planetcare_teacher_panel.html   # Main Vue.js app (all-in-one)
├── components/                      # Component HTML files (optional modular)
├── default-questions.json           # Default climate-change question templates
├── README.md                         # This file
├── DEPLOYMENT.md                    # Deployment guide
└── ARCHITECTURE.md                  # Technical deep-dive
```

---

## 🚀 Getting Started

### Prerequisites

- Firebase project (free tier works for MVP)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd planetcare
   ```

2. **Set up Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named "planetcare"
   - Enable Authentication (Email/Password)
   - Create a Firestore database (production mode, start with allow read/write)
   - Create a Realtime Database
   - Copy your config from Project Settings

3. **Update Firebase Config**
   - Open `planetcare_teacher_panel.html`
   - Find the `firebaseConfig` object near the bottom
   - Replace with your project credentials

4. **Set Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Teachers can manage their own data
       match /teachers/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
       // Classes belong to teachers
       match /classes/{classId} {
         allow read, write: if request.auth.uid == resource.data.teacherId;
         allow create: if request.auth.uid == request.resource.data.teacherId;
       }
       // Students belong to classes
       match /students/{studentId} {
         allow read, write: if request.auth.uid == resource.data.teacherId;
         allow create: if request.auth.uid == request.resource.data.teacherId;
       }
       // Events belong to teachers
       match /events/{eventId} {
         allow read, write: if request.auth.uid == resource.data.teacherId;
         allow create: if request.auth.uid == request.resource.data.teacherId;
       }
       // Templates belong to teachers or are public
       match /templates/{templateId} {
         allow read: if request.auth.uid == resource.data.teacherId || resource.data.isPublic == true;
         allow write: if request.auth.uid == resource.data.teacherId;
         allow create: if request.auth.uid == request.resource.data.teacherId;
       }
       // Sessions belong to teachers
       match /sessions/{sessionId} {
         allow read, write: if request.auth.uid == resource.data.teacherId;
         allow create: if request.auth.uid == request.resource.data.teacherId;
       }
     }
   }
   ```

5. **Open in Browser**
   ```bash
   # Simple HTTP server (Python 3)
   python -m http.server 8000
   
   # Then visit: http://localhost:8000/planetcare_teacher_panel.html
   ```

---

## 🎮 How to Use

### Teacher Workflow

#### 1. Sign Up
- Register with email, name, and subject/grade level
- Account is created in Firebase

#### 2. Create a Class
- Go to **Classes** tab
- Click **+ Add Class**
- Enter class name, section, school year
- Add students via the class detail modal

#### 3. Create Game Events (Questions)
- Go to **Events** tab
- Click **+ Add Event**
- Create a question with 4 choices (A, B, C, D)
- Mark answers as Good/Bad/Neutral
- Optional: Enable mini-game flag
- **Tip**: Use the **📚 Templates** button to browse pre-made questions

#### 4. Create a Reusable Template (Optional)
- Go to **Templates** tab
- Click **+ Create Template**
- Add a name and description
- Add events from the Events tab
- Toggle public/private (with optional access code)

#### 5. Start a Live Session
- Go to **Overview** tab
- Select a class
- Click **🎲 Create Session**
- Share the **6-digit PIN** with students
- Click **▶ Start Game**

#### 6. Control the Game
- Select events from the "Send Scenario to Students" list
- Mark as "● Live" when active
- Watch student responses in real-time
- See live leaderboard with scores
- Click **End Session** to finish

#### 7. View Reports
- Go to **Reports** tab
- Select a class
- See student performance summary (total score, sessions, averages)
- Green badges = excellent, yellow = average, red = needs help

#### 8. Settings
- Go to **Settings** tab
- View your profile info
- See dashboard statistics
- Learn about PlanetCare
- Logout when done

---

## 📊 Data Models

### Firestore Collections

#### `teachers/{userId}`
```javascript
{
  name: String,
  email: String,
  subject: String,
  school: String,
  createdAt: Timestamp
}
```

#### `classes/{classId}`
```javascript
{
  teacherId: String,
  name: String,
  section: String,
  schoolYear: String,
  studentCount: Number,
  createdAt: Timestamp
}
```

#### `students/{studentId}`
```javascript
{
  teacherId: String,
  classId: String,
  name: String,
  totalScore: Number,
  sessionCount: Number,
  createdAt: Timestamp
}
```

#### `events/{eventId}`
```javascript
{
  teacherId: String,
  question: String,
  category: String (waste|water|energy|climate|forest),
  hasMiniGame: Boolean,
  choices: [
    { text: String, effect: String (good|bad|neutral) }
  ],
  createdAt: Timestamp
}
```

#### `templates/{templateId}`
```javascript
{
  teacherId: String,
  name: String,
  description: String,
  isPublic: Boolean,
  accessCode: String (optional),
  events: Array<Events>,
  eventCount: Number,
  createdAt: Timestamp
}
```

#### `sessions/{sessionId}`
```javascript
{
  teacherId: String,
  classId: String,
  pin: String (6 digits),
  status: String (waiting|started|ended),
  studentCount: Number,
  topStudents: Array<{name, score}>,
  createdAt: Timestamp
}
```

### Realtime Database (RTDB) Structure

```
sessions/{PIN}/
  ├── status: String
  ├── current_scenario: Number
  ├── pin: String
  ├── sessionId: String
  └── students/
      ├── {studentId}/
      │   ├── name: String
      │   ├── score: Number
      │   └── answer: String
```

---

## 🔄 Data Flow

```
1. Teacher creates session → Firebase generates PIN
                          ↓
2. PIN stored in RTDB (live data)
                          ↓
3. Students join via PIN → RTDB student entry created
                          ↓
4. Teacher sends scenario → RTDB current_scenario updates
                          ↓
5. Students answer → RTDB students/{studentId}/answer updates
                          ↓
6. Teacher sees live → Dashboard listens to RTDB changes
                          ↓
7. Session ends → Results saved to Firestore
```

---

## 🎨 UI/UX Components

### Color Scheme
- **Primary**: Green (#22c55e, #16a34a, #15803d)
- **Background**: Dark gray/black (#111827, #1f2937)
- **Accents**: Yellow (warnings), Red (destructive), Blue (info)

### Key Screens

| Screen | Purpose | Features |
|--------|---------|----------|
| **Auth** | Login/Register | Email, password, profile setup |
| **Dashboard** | Overview | New session, active session, stats |
| **Classes** | Class management | CRUD classes, student rosters, edit details |
| **Events** | Question bank | Create/edit/delete events, add to templates |
| **Templates** | Reusable sets | Create templates, manage public/private |
| **History** | Session records | Past sessions, top performers, analytics |
| **Reports** | Analytics | Per-class performance, student insights |
| **Settings** | Account | Profile info, statistics, logout |

---

## 🔐 Security

### Authentication
- Firebase Authentication (email/password)
- Session tokens managed by Firebase SDK
- No credentials stored in localStorage

### Authorization
- Teacher can only manage own data (Firestore rules)
- Students can only write their own answers (RTDB rules)
- Public templates readable by everyone

### Best Practices
- Never expose Firebase API keys in production (use rules)
- Enable HTTPS for all connections
- Regularly review and update security rules
- Monitor Firebase usage for unusual activity

---

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:
- Hosting on Firebase Hosting
- Deploying to Vercel / Netlify
- Custom domain setup
- SSL/HTTPS configuration

---

## 📱 Mobile Game Integration

The Godot mobile app will:
1. Connect to Firebase using Godot Firebase plugin
2. Listen to `sessions/{PIN}/` in RTDB
3. Display scenarios when `current_scenario` changes
4. Send answers to `sessions/{PIN}/students/{studentId}/answer`
5. Show real-time leaderboard from RTDB updates

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for full integration details.

---

## 🐛 Troubleshooting

### Quiz Not Loading
- Check Firebase config is correct
- Verify browser console for CORS errors
- Ensure Firestore rules allow read access

### Students Can't Join
- Verify PIN is correct (6 digits)
- Check RTDB is initialized with session
- Ensure Godot app has correct Firebase config

### Real-time Updates Not Working
- Check internet connection
- Verify RTDB rules are permissive (start with `allow read, write: if true`)
- Check Firebase quota hasn't been exceeded

### Performance Issues
- Limit events per query (pagination)
- Index frequently queried collections
- Monitor Firebase usage in console

---

## 📚 Resources

- [Vue.js 3 Documentation](https://vuejs.org)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Godot Engine](https://godotengine.org)

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more question templates
- Improve the UI/UX
- Enhance security rules
- Create tutorials or documentation

---

## 📄 License

MIT License - Free to use for educational purposes.

---

## 👨‍💻 Author

Built with ❤️ for educators and climate-conscious students worldwide.

**Made for AMA Computer College East Rizal** 🇵🇭

---

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section
2. Review **ARCHITECTURE.md** for technical details
3. Check Firebase Console for errors
4. Review browser console logs

---

**Last Updated**: April 2026  
**Version**: 1.0 (MVP)
