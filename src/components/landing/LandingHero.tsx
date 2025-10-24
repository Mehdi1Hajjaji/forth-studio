import Image from "next/image";

const icons = [
  { id: "atom", src: "/assets/icons/atom.png", alt: "Atom", width: 48, style: { top: "15%", left: "10%" } },
  { id: "c-plus", src: "/assets/icons/c-plus.png", alt: "C Plus", width: 52, style: { top: "25%", right: "15%" } },
  { id: "cloud", src: "/assets/icons/cloud.png", alt: "Cloud", width: 48, style: { top: "50%", left: "20%" } },
  { id: "cs", src: "/assets/icons/cs.png", alt: "CS", width: 44, style: { top: "65%", right: "25%" } },
  { id: "diamond", src: "/assets/icons/Diamond.png", alt: "Diamond", width: 42, style: { top: "5%", right: "20%" } },
  { id: "gear", src: "/assets/icons/gear.png", alt: "Gear", width: 50, style: { bottom: "10%", right: "10%" } },
  { id: "heart", src: "/assets/icons/heart.png", alt: "Heart", width: 48, style: { top: "30%", left: "30%" } },
  { id: "html5", src: "/assets/icons/HTML5.png", alt: "HTML5", width: 46, style: { top: "55%", right: "35%" } },
  { id: "js", src: "/assets/icons/JavaScript.png", alt: "JS", width: 44, style: { top: "70%", left: "40%" } },
  { id: "logo", src: "/assets/icons/logo.png", alt: "Logo", width: 40, style: { top: "10%", left: "50%", transform: "translateX(-50%)" } },
  { id: "node-js", src: "/assets/icons/node-js.png", alt: "Node.js", width: 48, style: { top: "35%", right: "45%" } },
  { id: "python", src: "/assets/icons/python.png", alt: "Python", width: 50, style: { bottom: "20%", left: "30%" } },
  { id: "recycle", src: "/assets/icons/recycle.png", alt: "Recycle", width: 42, style: { top: "85%", right: "40%" } },
];

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5.5 14.5 14.2 5.8" />
      <path d="M7.2 5.8h7v7" />
    </svg>
  );
}

export function LandingHero() {
  return (
    <section className="relative mx-auto max-w-[1180px] px-6 pb-28 pt-24 text-center sm:pb-32 sm:pt-28">
      {icons.map((icon) => (
        <div key={icon.id} className="pointer-events-none absolute select-none w-10 h-10 md:w-16 md:h-16" style={icon.style}>
          <Image
            src={icon.src}
            alt={icon.alt}
            width={icon.width}
            height={icon.width}
            className="particle"
            priority
          />
        </div>
      ))}

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <h1 className="text-balance font-bold text-5xl md:text-7xl leading-tight tracking-tighter text-white">
          Advance Your <span className="bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent font-bold">Code</span>,
          <br className="hidden sm:block" />
          Advance Your Career
        </h1>
        <p className="text-lg font-semibold text-[#c7c7c7]">Experiment. Fail. Forge Your Future.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <button className="flex items-center bg-gradient-to-r from-purple-500 to-blue-400 px-8 py-4 text-white rounded-xl shadow-lg font-bold transition-transform hover:-translate-y-0.5">
            <ArrowUpIcon className="mr-2 w-5 h-5" />
            Start Today&apos;s Algorithm
          </button>
          <button className="flex items-center border border-purple-500/50 bg-transparent px-8 py-4 text-white rounded-full font-semibold">
            Explore The Fail Wall
          </button>
        </div>
      </div>
    </section>
  );
}