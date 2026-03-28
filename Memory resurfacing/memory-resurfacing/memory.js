// 🧠 Memory store (simulate database)

export const memoryStore = [
  {
    id: 1,
    text: "React performance optimization using memo and lazy loading",
    tags: ["react", "performance"],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    usage: 3
  },
  {
    id: 2,
    text: "Improve React speed by reducing unnecessary re-renders",
    tags: ["react", "optimization"],
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    usage: 5
  },
  {
    id: 3,
    text: "HTML basics and semantic tags",
    tags: ["html"],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
    usage: 1
  }
];
