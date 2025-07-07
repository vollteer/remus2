import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export const Navigation = component$(() => {
const location = useLocation();

// Helper function to check if link is active
const isActive = (href: string) => {
return location.url.pathname === href ||
(href !== '/' && location.url.pathname.startsWith(href));
};

return (
<nav class="nav-sidebar">
{/* Header */}
<div class="nav-header">
<div class="nav-logo">
<div class="nav-logo-icon">📋</div>
<div class="nav-logo-text">
<h1>Requirements</h1>
<p>Management System</p>
</div>
</div>
</div>


  {/* Main Navigation */}
  <div class="nav-content">
    <div class="nav-section">
      <p class="nav-section-title">Hauptmenü</p>
    </div>
   
    <div class="nav-links">
      <a href="/" class={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">🏠</span>
        <span class="nav-link-text">Dashboard</span>
      </a>
     
      <a href="/requirements/overview" class={`nav-link ${isActive('/requirements') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">📋</span>
        <span class="nav-link-text">Anforderungen</span>
      </a>
     
      <a href="/search" class={`nav-link ${isActive('/search') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">🔍</span>
        <span class="nav-link-text">Suche</span>
      </a>
     
      <a href="/calendar" class={`nav-link ${isActive('/calendar') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">📅</span>
        <span class="nav-link-text">Kalender</span>
      </a>
    </div>
   
    {/* Admin Section */}
    <div class="nav-section">
      <p class="nav-section-title">Administration</p>
    </div>
   
    <div class="nav-links">
      <a href="/monitoring" class={`nav-link ${isActive('/monitoring') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">📊</span>
        <span class="nav-link-text">Monitoring</span>
      </a>
     
      <a href="/administration" class={`nav-link ${location.url.pathname === '/administration' || location.url.pathname === '/administration/' ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">⚙️</span>
        <span class="nav-link-text">Einstellungen</span>
      </a>

      <a href="/administration/workflows" class={`nav-link ${isActive('/administration/workflows') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">🎯</span>
        <span class="nav-link-text">Workflow Designer</span>
      </a>
                     
      <a href="/administration/forms" class={`nav-link ${isActive('/administration/forms') ? 'nav-link-active' : ''}`}>
        <span class="nav-link-icon">📝</span>
        <span class="nav-link-text">Enhanced Form Builder</span>
      </a>
    </div>
  </div>
 
  {/* User Profile */}
  <div class="nav-user">
    <div class="nav-user-info">
      <div class="nav-user-avatar">MM</div>
      <div class="nav-user-details">
        <p class="nav-user-name">Max Mustermann</p>
        <p class="nav-user-role">Administrator</p>
      </div>
    </div>
  </div>
 
  <style>{`
    .nav-sidebar {
      background: linear-gradient(180deg, rgb(0, 72, 116) 0%, rgb(0, 55, 88) 100%);
      width: 280px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
    }
   
    .nav-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
   
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
   
    .nav-logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, rgb(0, 158, 227) 0%, rgb(0, 200, 255) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 8px rgba(0, 158, 227, 0.3);
    }
   
    .nav-logo-text h1 {
      color: white;
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }
   
    .nav-logo-text p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.75rem;
      margin: 0;
      font-weight: 500;
    }
   
    .nav-content {
      flex: 1;
      padding: 1.5rem 0;
      overflow-y: auto;
    }
   
    .nav-section {
      padding: 0 1.5rem;
      margin-bottom: 1rem;
    }
   
    .nav-section-title {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }
   
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 2rem;
    }
   
    .nav-link {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      padding: 0.875rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      position: relative;
    }
   
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      border-left-color: rgba(255, 255, 255, 0.5);
      color: white;
    }
   
    .nav-link-active {
      background: linear-gradient(90deg, rgba(0, 158, 227, 0.2) 0%, rgba(0, 158, 227, 0.05) 100%);
      border-left-color: rgb(0, 158, 227);
      color: white;
    }
   
    .nav-link-active::after {
      content: '';
      position: absolute;
      right: 1.5rem;
      width: 6px;
      height: 6px;
      background: rgb(0, 158, 227);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0, 158, 227, 0.6);
    }
   
    .nav-link-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }
   
    .nav-link-text {
      font-weight: 500;
      font-size: 0.9rem;
    }
   
    .nav-user {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
    }
   
    .nav-user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
   
    .nav-user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgb(0, 158, 227) 0%, rgb(0, 200, 255) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
      box-shadow: 0 2px 8px rgba(0, 158, 227, 0.3);
    }
   
    .nav-user-name {
      color: white;
      font-weight: 600;
      margin: 0;
      font-size: 0.875rem;
    }
   
    .nav-user-role {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-size: 0.75rem;
    }
  `}</style>
</nav>


);
});
