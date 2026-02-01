// src/pages/test-styles.tsx
// THIS IS A TEST PAGE - Use this to verify your styles are working
// Visit: http://localhost:3000/test-styles

import Head from "next/head";

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-awa-charcoal">
      <Head>
        <title>AwaChapter - Style Test</title>
      </Head>

      {/* Test Container */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center py-10">
          <h1 className="font-serif text-5xl text-white mb-4">
            Style Test Page
          </h1>
          <p className="font-sans text-white/60 text-sm">
            If you can see this styled correctly, Tailwind is working! ✅
          </p>
        </div>

        {/* Color Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">1. Color Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-awa-charcoal border border-white/20 rounded-awa p-4 text-center">
              <div className="w-full h-20 bg-awa-charcoal rounded mb-2"></div>
              <p className="text-white font-sans text-xs">Charcoal</p>
            </div>
            <div className="bg-awa-charcoal border border-white/20 rounded-awa p-4 text-center">
              <div className="w-full h-20 bg-awa-charcoal-light rounded mb-2"></div>
              <p className="text-white font-sans text-xs">Charcoal Light</p>
            </div>
            <div className="bg-awa-charcoal border border-white/20 rounded-awa p-4 text-center">
              <div className="w-full h-20 bg-awa-gold rounded mb-2"></div>
              <p className="text-white font-sans text-xs">Gold</p>
            </div>
            <div className="bg-awa-charcoal border border-white/20 rounded-awa p-4 text-center">
              <div className="w-full h-20 bg-awa-gold-light rounded mb-2"></div>
              <p className="text-white font-sans text-xs">Gold Light</p>
            </div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            2. Typography Test
          </h2>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa p-6 space-y-4">
            <div>
              <p className="text-white/60 font-sans text-xs mb-1">
                Serif (Playfair Display)
              </p>
              <h3 className="font-serif text-4xl text-white">
                The Quick Brown Fox
              </h3>
            </div>
            <div>
              <p className="text-white/60 font-sans text-xs mb-1">
                Sans (Inter)
              </p>
              <p className="font-sans text-lg text-white">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </section>

        {/* Glassmorphism Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            3. Glassmorphism Test
          </h2>
          <div className="relative h-64 rounded-awa-lg overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500"></div>

            {/* Glass card on top */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-awa p-8 text-center">
                <h3 className="font-serif text-2xl text-white mb-2">
                  Glassmorphism Card
                </h3>
                <p className="font-sans text-white/80 text-sm">
                  You should see a frosted glass effect
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Button Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            4. Interactive Elements
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-white hover:bg-white/90 text-awa-charcoal font-sans font-bold py-4 px-8 rounded-awa transition-all hover:shadow-awa-gold active:scale-95">
              Primary Button (White)
            </button>
            <button className="w-full bg-awa-gold hover:bg-awa-gold-light text-awa-charcoal font-sans font-bold py-4 px-8 rounded-awa transition-all active:scale-95">
              Secondary Button (Gold)
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-sans font-semibold py-4 px-8 rounded-awa transition-all">
              Outline Button (Glass)
            </button>
          </div>
        </section>

        {/* Animation Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            5. Animation Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa p-6 text-center animate-fadeIn">
              <p className="text-white font-sans text-sm">Fade In</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa p-6 text-center animate-slideUp">
              <p className="text-white font-sans text-sm">Slide Up</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa p-6 text-center animate-pulse">
              <p className="text-white font-sans text-sm">Pulse</p>
            </div>
          </div>
        </section>

        {/* Ken Burns Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            6. Ken Burns Effect Test
          </h2>
          <div className="relative h-64 rounded-awa-lg overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 animate-kenburns"></div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-white font-sans text-sm">
                Watch the background slowly zoom (20s loop)
              </p>
            </div>
          </div>
        </section>

        {/* Gradient Test */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-awa-gold">
            7. Gradient Scrim Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-48 rounded-awa overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500"></div>
              <div className="absolute inset-0 bg-scrim-bottom flex items-end p-6">
                <p className="text-white font-sans text-sm">Bottom Scrim</p>
              </div>
            </div>
            <div className="relative h-48 rounded-awa overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500"></div>
              <div className="absolute inset-0 bg-scrim-top flex items-start p-6">
                <p className="text-white font-sans text-sm">Top Scrim</p>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="bg-awa-gold/20 border-2 border-awa-gold rounded-awa-lg p-8 text-center">
          <h2 className="font-serif text-3xl text-awa-gold mb-4">
            ✅ Success!
          </h2>
          <p className="font-sans text-white text-sm mb-4">
            If you can see all the tests above styled correctly, your Tailwind
            setup is working perfectly.
          </p>
          <p className="font-sans text-white/60 text-xs">
            You can now delete this test page and use your actual components.
          </p>
        </section>
      </div>
    </div>
  );
}
