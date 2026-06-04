import React, { Suspense } from "react";

const Spline = React.lazy(() => import("@splinetool/react-spline"));

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      {/* Spline 3D background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      {/* Content — anchored bottom-left */}
      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-14 pt-32">
        {/* Heading */}
        <h1
          className="opacity-0 animate-fade-up text-foreground font-bold leading-[1.05] tracking-[-0.05em] mb-2 md:mb-4 uppercase"
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            animationDelay: "0.2s",
          }}
        >
          SENTINEL <span className="text-primary">AI</span>
        </h1>

        {/* Subheading */}
        <p
          className="opacity-0 animate-fade-up text-foreground/80 font-light mb-3 md:mb-6"
          style={{
            fontSize: "clamp(1.125rem, 2.5vw, 1.875rem)",
            animationDelay: "0.4s",
          }}
        >
          We implement security correctly.
        </p>

        {/* Description */}
        <p
          className="opacity-0 animate-fade-up text-muted-foreground font-light mb-4 md:mb-8"
          style={{
            fontSize: "clamp(0.875rem, 1.5vw, 1.25rem)",
            animationDelay: "0.55s",
          }}
        >
          Enterprise security systems built in days. AI-powered surveillance deployed with
          zero-trust architecture. Smart access control set up for your entire facility. All
          of it done right, not just fast.
        </p>

        {/* CTA buttons */}
        <div
          className="opacity-0 animate-fade-up flex flex-wrap gap-3 font-bold"
          style={{ animationDelay: "0.7s" }}
        >
          <button className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97]">
            Book a Call
          </button>
          <button
            className="pointer-events-auto bg-white text-background px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-90 transition-all active:scale-[0.97]"
            onClick={() => document.getElementById("brands")?.scrollIntoView({ behavior: "smooth" })}
          >
            Our Work
          </button>
        </div>

        {/* Trust line */}
        <p
          className="opacity-0 animate-fade-up text-xs font-light mt-4 md:mt-6"
          style={{
            color: "hsl(var(--muted-foreground) / 0.6)",
            animationDelay: "0.85s",
          }}
        >
          Trusted security partner. Columbus, OH. 12 systems deployed.
        </p>
      </div>
    </section>
  );
}
