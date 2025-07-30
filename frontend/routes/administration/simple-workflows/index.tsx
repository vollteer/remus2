import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import SimpleWorkflowDesigner from '~/components/administration/simple-workflow-designer';

export default component$(() => {
  return <SimpleWorkflowDesigner />;
});

export const head: DocumentHead = {
  title: 'Simple Workflow Designer - Requirements Management',
  meta: [
    {
      name: 'description',
      content: 'Vereinfachter Workflow-Designer für Requirements Management System',
    },
  ],
};