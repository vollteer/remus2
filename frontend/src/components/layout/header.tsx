import { component$ } from '@builder.io/qwik';

export const Header = component$(() => {
  return (
    <header class="app-header">
      <div class="header-content">
        <div class="header-title">
          <h2>REMUS 2.0</h2>
          <p>Workflow-based Requirement System</p>
        </div>
        
        <div class="header-actions">
		<a href="/requirements/new" class="btn btn-primary">
		  <span>+</span>
		  Neue Anforderung
		</a>
          
          <div class="header-search">
            <input 
              type="text" 
              placeholder="Suchen..." 
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          
          <div class="header-notifications">
            <button class="notification-btn">
              <span>🔔</span>
              <span class="notification-badge">3</span>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .app-header {
          background: linear-gradient(135deg, white 0%, #fafbfc 100%);
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-title h2 {
          color: var(--primary-color);
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }
        
        .header-title p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
          margin-top: 0.25rem;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-search {
          position: relative;
        }
        
        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          background: white;
          font-size: 0.875rem;
          width: 300px;
          transition: all 0.2s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(0, 158, 227, 0.1);
        }
        
        .search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        .notification-btn {
          position: relative;
          background: none;
          border: none;
          padding: 0.75rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.25rem;
        }
        
        .notification-btn:hover {
          background: var(--background-color);
        }
        
        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: var(--error-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          min-width: 18px;
          text-align: center;
        }
      `}</style>
    </header>
  );
});