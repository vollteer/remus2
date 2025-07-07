import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { UnderConstruction } from '~/components/under-construction/under-construction';

// export const underConstruction = component$(() => {
	// const particlesRef = useSignal

export default component$(() => {
return <UnderConstruction />;
});

export const head: DocumentHead = {
title: 'Seite in Bearbeitung',
meta: [
{
name: 'description',
content: 'Diese Seite befindet sich noch im Aufbau. Wir arbeiten daran!',
},
],
};


