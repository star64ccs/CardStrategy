module.exports = {
  developerTools: {
    sdk: {
      enabled: true,
      languages: ['javascript', 'python', 'java'],
      documentation: true,
    },
    api: {
      documentation: true,
      playground: true,
      examples: true,
    },
    testing: {
      tools: true,
      sandbox: true,
      mockData: true,
    },
  },
  marketplace: {
    enabled: false,
    apiDiscovery: true,
    rateLimiting: true,
    analytics: true,
    monetization: false,
  },
  plugins: {
    enabled: false,
    architecture: 'modular',
    manager: true,
    marketplace: false,
    sdk: true,
  },
  community: {
    forum: false,
    discord: false,
    github: true,
    events: false,
  },
  content: {
    tutorials: false,
    caseStudies: false,
    bestPractices: false,
    videos: false,
  },
};
