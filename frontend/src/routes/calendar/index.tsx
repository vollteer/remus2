// src/routes/calendar/index.tsx
import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import { RequirementsCalendarView } from '~/components/calendar/requirements-calendar-view';

export default component$(() => {
return (
<div class="page-wrapper">
<RequirementsCalendarView />
</div>
);
});

export const head: DocumentHead = {
title: 'Kalender - Requirements Management',
meta: [
{
name: 'description',
content: 'Requirements Kalender mit Deadlines, Meilensteine und Releases im Überblick'
}
]
};

// Alternative: Wenn du zusätzliche Loader brauchst
// src/routes/calendar/index.tsx (Advanced Version)
import { component$ } from '@builder.io/qwik';
import { DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { RequirementsCalendarView } from '~/components/calendar/requirements-calendar-view';

// Optional: Server-side data loading
export const useCalendarData = routeLoader$(async (requestEvent) => {
// Hier könntest du Server-side Daten laden
// z.B. initial requirements oder user permissions

try {
// Beispiel API Call (falls du Server-side rendern willst)
// const response = await fetch(`${process.env.API_BASE_URL}/requirements/calendar`, {
//   headers: {
//     'Authorization': `Bearer ${requestEvent.cookie.get('auth_token')?.value}`
//   }
// });


// if (!response.ok) {
//   throw new Error('Failed to fetch calendar data');
// }

// const data = await response.json();
// return data;

// Für jetzt returnen wir erstmal null - Client-side loading
return null;


} catch (error) {
console.error('Error loading calendar data:', error);
return null;
}
});

export default component$(() => {
// Optional: Server-side geladene Daten verwenden
// const calendarData = useCalendarData();

return (
<div class="page-wrapper">
<RequirementsCalendarView />
</div>
);
});



// Zusätzliche Route für Calendar API Integration
// src/routes/api/calendar/events/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';

// GET /api/calendar/events
export const onGet: RequestHandler = async ({ json, url, cookie }) => {
try {
// URL Parameter extrahieren
const startDate = url.searchParams.get('start');
const endDate = url.searchParams.get('end');
const requirementTypes = url.searchParams.get('types')?.split(',') || [];


// Auth Token aus Cookie holen (falls vorhanden)
const authToken = cookie.get('auth_token')?.value;

// API Call zu deiner C# Backend
const response = await fetch(`${process.env.API_BASE_URL}/api/calendar/events`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  },
  // Query params weiterleiten
  // In der Praxis würdest du hier die Filter richtig formatieren
});

if (!response.ok) {
  throw new Error(`API responded with ${response.status}`);
}

const data = await response.json();

json(200, {
  success: true,
  data: data,
  timestamp: new Date().toISOString()
});


} catch (error) {
console.error('Calendar API Error:', error);


json(500, {
  success: false,
  error: 'Failed to fetch calendar events',
  message: error instanceof Error ? error.message : 'Unknown error'
});


}
};

// POST /api/calendar/events
export const onPost: RequestHandler = async ({ json, request, cookie }) => {
try {
const body = await request.json();
const authToken = cookie.get('auth_token')?.value;


// Forwarding to C# API
const response = await fetch(`${process.env.API_BASE_URL}/api/calendar/events`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
  },
  body: JSON.stringify(body)
});

if (!response.ok) {
  throw new Error(`API responded with ${response.status}`);
}

const data = await response.json();

json(200, {
  success: true,
  data: data
});


} catch (error) {
console.error('Calendar API Error:', error);


json(500, {
  success: false,
  error: 'Failed to create calendar event'
});


}
};

// Layout für Calendar Pages (optional)
// src/routes/calendar/layout.tsx
import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
return (
<div class="calendar-layout">
{/* Optional: Calendar-specific navigation oder breadcrumbs */}
<div class="calendar-header">
<nav class="breadcrumb">
<a href="/" class="breadcrumb-item">Home</a>
<span class="breadcrumb-separator">›</span>
<span class="breadcrumb-item current">Kalender</span>
</nav>
</div>


  <main class="calendar-content">
    <Slot />
  </main>
</div>


);
});

// Zusätzliche Calendar Views (optional)
// src/routes/calendar/requirements/[id]/index.tsx
import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
const location = useLocation();
const requirementId = location.params.id;

return (
<div class="requirement-calendar-detail">
<h1>Calendar Details für Requirement {requirementId}</h1>
{/* Hier könntest du eine detaillierte Ansicht für ein spezifisches Requirement zeigen */}
</div>
);
});

// src/routes/calendar/filters/index.tsx
import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
return (
<div class="calendar-filters-page">
<h1>Calendar Filter Management</h1>
{/* Hier könntest du eine separate Seite für erweiterte Filter haben */}
</div>
);
});
