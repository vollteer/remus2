// src/routes/administration/forms/index.tsx
import { component$ } from '@builder.io/qwik';
import { ModernFormBuilder } from '~/components/administration/modern-form-builder';

export default component$(() => {
return (
<div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
{/* Page Header */}
<div class="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
<div class="container mx-auto px-6 py-4">
<div class="flex items-center justify-between">
<div>
<h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
📝 Form Builder Administration
</h1>
<p class="text-slate-600 mt-1">
Erstelle und verwalte intelligente Formulare mit Workflow-Integration
</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-300">
📊 Analytics
</button>
<button class="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-300">
📥 Import/Export
</button>
<button 
class="px-6 py-2 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);"
>
🔄 Sync Workflows
</button>
</div>
</div>
</div>
</div>


  {/* Main Form Builder Component */}
  <ModernFormBuilder />

  {/* Feature Info Cards */}
  <div class="container mx-auto px-6 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
               style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);">
            🔐
          </div>
          <h4 class="font-bold text-blue-900">Smart Permissions</h4>
        </div>
        <p class="text-sm text-blue-800">
          Definiere granulare Berechtigungen pro Feld. 
          allowedRoles, readOnlyRoles, hideFromRoles - alles möglich!
        </p>
      </div>

      <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 shadow-lg">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
               style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
            ⚡
          </div>
          <h4 class="font-bold text-orange-900">Light Mode</h4>
        </div>
        <p class="text-sm text-orange-800">
          Erstelle Express-Formulare mit nur den wichtigsten Feldern. 
          Perfect für Power-User und schnelle Eingaben.
        </p>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
               style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);">
            🎯
          </div>
          <h4 class="font-bold text-purple-900">Workflow-Binding</h4>
        </div>
        <p class="text-sm text-purple-800">
          Binde Felder an spezifische Workflow-Steps. 
          Zeige relevante Felder je nach Prozess-Phase dynamisch an.
        </p>
      </div>
    </div>
  </div>

  {/* Quick Stats */}
  <div class="container mx-auto px-6 pb-8">
    <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
      <h3 class="text-lg font-bold text-slate-800 mb-4">📊 Form Builder Stats</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">12</div>
          <div class="text-sm text-slate-600">Active Forms</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">47</div>
          <div class="text-sm text-slate-600">Total Fields</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">8</div>
          <div class="text-sm text-slate-600">Workflows</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">156</div>
          <div class="text-sm text-slate-600">Submissions</div>
        </div>
      </div>
    </div>
  </div>
</div>


);
});
