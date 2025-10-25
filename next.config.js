const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Handle common case-sensitivity mistakes in static asset paths
      { source: "/assets/icons/diamond.png", destination: "/assets/icons/Diamond.png" },
      { source: "/assets/icons/html.png", destination: "/assets/icons/HTML5.png" },
      { source: "/assets/icons/html5.png", destination: "/assets/icons/HTML5.png" },
      { source: "/assets/icons/javascript.png", destination: "/assets/icons/JavaScript.png" },
    ];
  },
};

module.exports = nextConfig;

