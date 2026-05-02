# Quick Reference Guide - PlanetCare Modular Architecture

## 📁 File Structure Map

### JavaScript Modules (`js/`)
```
js/
├── firebase-config.js      ⚙️ Firebase setup (edit if changing credentials)
├── firebase-service.js     🔄 Database operations (edit to add/change backend calls)
├── utils.js                🛠️ Helper functions (edit to add new utilities)
└── app.js                  🎯 Main Vue app (edit for logic & state)
```

### Component Templates (`app-components/`)
```
Organized by tab number for easy editing:
├── 01-overview.html        Dashboard stats & session control
├── 02-classes.html         Class management & student enrollment
├── 03-events.html          Game events & template library
├── 04-templates.html       Save & manage event templates
├── 05-history.html         Session history & analytics
├── 06-reports.html         Student performance reports
└── 07-settings.html        Profile & account settings
```

---

## 🎯 What to Edit for Different Tasks

### Adding a New Database Feature
1. **js/firebase-service.js** - Add the Firebase function
2. **js/app.js** - Add state & methods that call it
3. **Update relevant .html component** - Add UI for the feature

**Example:** Adding event sharing feature
```javascript
// In firebase-service.js
export async function shareEvent(eventId, teacherId) {
  // Add sharing logic here
}

// In app.js - add to setup()
async function shareEvent(id) {
  await FirebaseService.shareEvent(id, teacher.value.id);
}

// In app-components/03-events.html
<button @click="shareEvent(e.id)">Share</button>
```

### Fixing a Bug
1. **Identify which section** (Overview, Classes, Events, etc.)
2. **Edit the matching component file** (01-.html to 07-.html)
3. **OR if it's logic**, edit **js/app.js**
4. **OR if it's a database issue**, edit **js/firebase-service.js**

### Adding a New Helper Function
1. **js/utils.js** - Define the function
2. **js/app.js** - Import and expose it
3. **Component file** - Use it in template

**Example:**
```javascript
// utils.js
export function myNewHelper(value) {
  return value * 2;
}

// app.js - add to return list
myNewHelper: utils.myNewHelper

// In any component
<div>{{myNewHelper(123)}}</div>
```

---

## 🔗 Data Flow

```
User interacts with UI
      ↓
Component click handler (in app.js)
      ↓
App method calls FirebaseService
      ↓
FirebaseService handles Firebase operation
      ↓
Data returned & Vue state updated
      ↓
Template reactively updates
```

---

## 📝 Common Tasks

### Task: Hide/Show Something Based on State
**Edit:** `app-components/XX-*.html`
```html
<!-- Vue's v-if, v-show, v-for work just like before -->
<div v-if="activeSession">Session is active</div>
<button v-for="class in classes" :key="class.id">{{class.name}}</button>
```

### Task: Add a New Button Action
**Edit:** `app.js` (add method) + component file (add button)
```javascript
// In app.js setup()
async function myNewAction() {
  // Do something
}

// Add to return statement
myNewAction
```

```html
<!-- In component -->
<button @click="myNewAction">Do Something</button>
```

### Task: Change a Color or Style
**Edit:** `app-components/XX-*.html` - Just modify the Tailwind classes
```html
<!-- Change from green-500 to blue-500 -->
<button class="bg-blue-500 hover:bg-blue-400">Submit</button>
```

### Task: Add a New Input Field
**Edit:** Both component file AND app.js state
```javascript
// In app.js
const myNewField = ref('');

// In return statement
myNewField

// In component
<input v-model="myNewField" placeholder="Enter something" />
```

### Task: Call Database & Load Data
**Edit:** `js/firebase-service.js` + `js/app.js`
```javascript
// firebase-service.js
export async function loadMyData(teacherId) {
  // return data from Firebase
}

// app.js
async function loadMyData(uid) {
  myData.value = await FirebaseService.loadMyData(uid);
}
```

---

## 🔍 Debugging Tips

**Console shows errors?**
- Check `js/firebase-service.js` for Firebase calls
- Check `js/app.js` for Vue methods
- Check component `.html` for syntax errors

**Data not showing?**
- Verify state is defined in `app.js`
- Verify it's in the `return { }` statement
- Check if `v-if` or `v-show` is hiding it

**Button doesn't work?**
- Check method exists in `app.js`
- Check `@click="methodName"` is spelled correctly
- Check method is included in `return { }`

**Database not saving?**
- Check `firebase-service.js` has the function
- Verify `app.js` calls it correctly
- Check Firebase credentials in `firebase-config.js`

---

## ✅ Testing Checklist Before Deploying

- [ ] Tested login/register
- [ ] Tested creating a class
- [ ] Tested adding students
- [ ] Tested creating events
- [ ] Tested starting a session
- [ ] Tested viewing reports
- [ ] No console errors
- [ ] Mobile view looks good

---

## 📞 Quick Lookup

| Need to... | Edit file... | Change type... |
|---|---|---|
| Change a color | Component `.html` | Tailwind CSS |
| Add a button | Component `.html` | HTML |
| Add logic | `app.js` | JavaScript |
| Connect to Firebase | `firebase-service.js` | JavaScript |
| Add helper function | `utils.js` | JavaScript |
| Change page title | `index.html` | HTML |
| Change layout | Component `.html` | HTML |
| Update state | `app.js` | State ref |
| Load data | `firebase-service.js` + `app.js` | JS |

---

## 🚀 Now You're Ready!

Each file is focused on one job:
- **config** = setup
- **service** = database
- **utils** = helpers  
- **app** = logic
- **components** = visuals

Much easier to find and fix things! Happy coding! 🎉
