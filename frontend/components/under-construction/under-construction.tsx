import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export default component$(() => {
  const particlesRef = useSignal<Element | undefined>(undefined);

  useVisibleTask$(() => {
    const createParticle = () => {
      if (!particlesRef.value) return;
      
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-pulse';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particlesRef.value.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 6000);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white overflow-hidden">
      <div 
        ref={particlesRef}
        class="fixed inset-0 pointer-events-none z-10"
      >
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 10%; animation-delay: 0s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 20%; animation-delay: 0.5s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 30%; animation-delay: 1s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 40%; animation-delay: 1.5s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 50%; animation-delay: 2s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 60%; animation-delay: 2.5s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 70%; animation-delay: 3s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 80%; animation-delay: 3.5s;"></div>
        <div class="absolute w-1 h-1 bg-white bg-opacity-30 rounded-full animate-bounce" style="left: 90%; animation-delay: 4s;"></div>
      </div>

      <div class="text-center max-w-2xl px-8 relative z-20">
        <div class="text-6xl mb-6 animate-bounce">🚧</div>
        
        <h1 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
          Seite im Aufbau
        </h1>
        
        <p class="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
          Yo, wir basteln hier gerade an was richtig Geiles! 
          Die Seite ist noch nicht ganz fertig, aber wir sind schon voll am Werkeln.
        </p>

        <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-1 mb-4">
          <div class="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
        </div>
        <p class="text-sm opacity-80 mb-8">Geschätzte Fertigstellung: Bald™</p>

        <div class="flex flex-wrap justify-center gap-4">
          <a 
            href="#" 
            class="inline-flex items-center px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-white font-medium hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
          >
            📱 Follow uns
          </a>
          <a 
            href="#" 
            class="inline-flex items-center px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-white font-medium hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
          >
            💬 Support
          </a>
          <a 
            href="/" 
            class="inline-flex items-center px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-white font-medium hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1"
          >
            🏠 Zurück zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
});
