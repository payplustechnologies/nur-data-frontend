# MBR Data Admin Frontend

This directory is the standalone administrator frontend application.

- `index.html` — administrator login
- `dashboard.html` — administrator dashboard
- `assets/css` — admin-only styles
- `assets/js` — admin API client, authentication and page controllers
- `assets/vendor` — local copies of the legacy Atlantis admin theme assets

The customer-facing frontend remains in `../mbrfrontend`. Admin files must not
be added to that directory. Both applications communicate with the Laravel
backend in `../mbrbackend` through REST APIs.

Local development URL: `http://127.0.0.1:4273/`

