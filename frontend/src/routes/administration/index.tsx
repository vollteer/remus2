// Alternativ: Für Seiten die noch nicht fertig sind
// src/routes/contact/index.tsx
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useRedirectToConstruction = routeLoader$(async ({ redirect }) => {
throw redirect(302, '/under-construction');
});

export default component$(() => {
return <div>Redirecting...</div>;
});
