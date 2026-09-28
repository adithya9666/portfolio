import type { Achievement } from "./types";

// Sourced directly from the resume's Achievements section.
// Rendered in the Recognition section (components/sections/Recognition.tsx),
// which excludes "leetcode-230" since that item has its own dedicated
// Problem Solving section.
export const achievements: Achievement[] = [
  {
    id: "leetcode-230",
    description:
      "Solved 230+ problems on LeetCode, strengthening algorithmic problem-solving across data structures and algorithms.",
  },
  {
    id: "quantanova-hackathon",
    description:
      "Participated in the Quantanova V1 National-Level 24-Hour Hackathon.",
  },
  {
    id: "icash-2024",
    description:
      'Presented research paper "Labour Market Prediction Using Machine Learning" at the ICASH 2024 International Conference.',
    year: "2024",
  },
];
