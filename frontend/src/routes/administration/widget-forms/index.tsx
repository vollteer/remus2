// src/routes/administration/widget-forms/index.tsx
import { component$ } from '@builder.io/qwik';
import { WidgetEnhancedFormBuilder } from '~/components/administration/widget-enhanced-form-builder';

export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Page Header */}
      <div class="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                📦 Widget Form Builder Administration
              </h1>
              <p class="text-slate-600 mt-1">
                Erstelle intelligente Formulare mit Widget-Gruppen und dynamischen Feldern
              </p>
            </div>
            <div class="flex gap-3">
              <button class="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-300">
                📊 Widget Analytics
              </button>
              <button class="px-4 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-300">
                📥 Template Import
              </button>
              <button 
                class="px-6 py-2 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);"
              >
                🔄 Sync Widget Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Widget Form Builder Component */}
      <WidgetEnhancedFormBuilder />

      {/* Widget Feature Info Cards */}
      <div class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                   style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);">
                📦
              </div>
              <h4 class="font-bold text-purple-900">Widget-Gruppen</h4>
            </div>
            <p class="text-sm text-purple-800">
              Erstelle wiederverwendbare Widget-Gruppen wie "Termine", "Budget", "Zuständigkeiten". 
              Drag & Drop für einfache Konfiguration.
            </p>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                   style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);">
                📅
              </div>
              <h4 class="font-bold text-blue-900">Termine Widget</h4>
            </div>
            <p class="text-sm text-blue-800">
              Dynamisches Termine-Widget mit AN/AG Spalten. 
              Beliebig viele Terminfelder mit individueller Benennung.
            </p>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                   style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                💰
              </div>
              <h4 class="font-bold text-green-900">Budget Widget</h4>
            </div>
            <p class="text-sm text-green-800">
              Budget-Planung mit AN/AG Aufteilung. 
              Integrierte Vorhaben-Suche und automatische Berechnungen.
            </p>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                   style="background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);">
                👥
              </div>
              <h4 class="font-bold text-orange-900">Zuständigkeiten</h4>
            </div>
            <p class="text-sm text-orange-800">
              Vordefinierte Rollen und Verantwortlichkeiten. 
              User-Suche mit Gruppen-Filter für optimale Zuordnung.
            </p>
          </div>
        </div>
      </div>

      {/* Widget Builder Advantages */}
      <div class="container mx-auto px-6 pb-8">
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
          <h3 class="text-lg font-bold text-slate-800 mb-4">🚀 Widget Builder Vorteile</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <h4 class="font-semibold text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                Intelligente Gruppierung
              </h4>
              <ul class="text-sm text-slate-600 space-y-1 pl-4">
                <li>• Logische Zusammenfassung verwandter Felder</li>
                <li>• Wiederverwendbare Widget-Templates</li>
                <li>• Einklappbare Gruppierungen für bessere UX</li>
                <li>• Automatische Validierung auf Widget-Ebene</li>
              </ul>
            </div>

            <div class="space-y-3">
              <h4 class="font-semibold text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                Dynamische Feldverwaltung
              </h4>
              <ul class="text-sm text-slate-600 space-y-1 pl-4">
                <li>• Felder zu Widgets hinzufügen/entfernen</li>
                <li>• Spalten-Layout (AN/AG) für Termine/Budget</li>
                <li>• User-Suche mit Gruppen-Filter</li>
                <li>• Requirement-Suche für Verknüpfungen</li>
              </ul>
            </div>
          </div>

          <div class="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
            <h4 class="font-semibold text-purple-800 mb-2">📋 Kleinanforderung Beispiel:</h4>
            <p class="text-sm text-purple-700">
              Die vollständige Kleinanforderung wurde als Widget-basiertes Formular implementiert mit:
              <strong> Zuständigkeiten-Widget</strong> (7 User-Felder), 
              <strong> Budget/Termine-Widget</strong> (AN/AG Spalten), 
              <strong> Prüfung-Widget</strong> (Checkboxen) und 
              <strong> einzelne Felder</strong> für Grunddaten.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats for Widget Builder */}
      <div class="container mx-auto px-6 pb-8">
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 shadow-lg">
          <h3 class="text-lg font-bold text-slate-800 mb-4">📊 Widget Builder Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">8</div>
              <div class="text-sm text-slate-600">Active Widgets</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">24</div>
              <div class="text-sm text-slate-600">Widget Fields</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">5</div>
              <div class="text-sm text-slate-600">Widget Types</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">15</div>
              <div class="text-sm text-slate-600">Individual Fields</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">1</div>
              <div class="text-sm text-slate-600">Kleinanforderung</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});