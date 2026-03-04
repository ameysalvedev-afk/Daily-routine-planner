# Daily Routine Planner

A simple, fully functional app to plan your daily routine in the browser.

## Features

- **Add tasks** with time, title, category, and optional notes
- **Categories**: Work, Health, Learning, Personal, Rest, Other
- **Mark tasks done** with one click (checkbox)
- **Edit** any task (time, title, category, notes)
- **Delete** tasks with confirmation
- **Auto-sorted** by time
- **Saved automatically** to your browser (localStorage), per day
- **Responsive** layout for mobile and desktop

## How to run

1. Open `index.html` in your browser (double-click the file or drag it into a browser window).

   **Or** from the project folder run a local server:

   ```bash
   # Python 3
   python -m http.server 8080

   # Node (if you have npx)
   npx serve .
   ```

2. Then visit `http://localhost:8080` (or the URL shown).

Your routine is stored per calendar day, so each day starts with a fresh list (or your saved list for that day if you used it before).
