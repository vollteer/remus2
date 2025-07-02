import { component$ } from '@builder.io/qwik';
import { EnhancedFormBuilder } from '~/components/administration/enhanced-form-builder';

export default component$(() => {
return (
<div class="container">
{/* Page Header */}
<div class="mb-6">
<div class="flex items-center justify-between">
<div>
<h1 class="text-3xl font-bold text-gray-900">Enhanced Form Builder</h1>
<p class="text-gray-600 mt-1">
Erstelle intelligente Formulare mit Permissions, Workflow-Binding und Light Mode 🚀
</p>
</div>
<div class="flex gap-3">
<button class="btn btn-secondary">
📊 Analytics
</button>
<button class="btn btn-secondary">
📥 Import/Export
</button>
<button class="btn btn-primary">
🔄 Workflows synchronisieren
</button>
</div>
</div>
</div>

```
  {/* Enhanced Form Builder Component */}
  <EnhancedFormBuilder />

  {/* Feature Help Cards */}
  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="card bg-blue-50 border-blue-200">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
          🔐
        </div>
        <h4 class="font-semibold text-blue-900">Smart Permissions</h4>
      </div>
      <p class="text-sm text-blue-800">
        Definiere granulare Berechtigungen pro Feld. 
        allowedRoles, readOnlyRoles, hideFromRoles - alles möglich!
      </p>
    </div>

    <div class="card bg-green-50 border-green-200">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">
          ⚡
        </div>
        <h4 class="font-semibold text-green-900">Light Mode</h4>
      </div>
      <p class="text-sm text-green-800">
        Erstelle Express-Formulare mit nur den wichtigsten Feldern. 
        Perfect für Power-User und schnelle Eingaben.
      </p>
    </div>

    <div class="card bg-purple-50 border-purple-200">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm">
          🎯
        </div>
        <h4 class="font-semibold text-purple-900">Workflow-Binding</h4>
      </div>
      <p class="text-sm text-purple-800">
        Binde Felder an spezifische Workflow-Steps. 
        Zeige relevante Felder je nach Prozess-Phase dynamisch an.
      </p>
    </div>
  </div>
</div>

);
});
