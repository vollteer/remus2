import { component$, Slot } from '@builder.io/qwik';
import { Navigation } from '../components/layout/navigation';
import { Header } from '../components/layout/header';

export default component$(() => {
  return (
    <div class="app-layout">
      <Navigation />
      <div class="app-main">
        <Header />
        <main class="app-content">
          <div class="container">
            <Slot />
          </div>
        </main>
      </div>
      
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--background-color);
        }
        
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .app-content {
          flex: 1;
          padding: 2rem 0;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
});