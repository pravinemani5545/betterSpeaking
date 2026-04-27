import type { QuestionCategory } from "@/types";

export const DEFAULT_QUESTIONS: { text: string; category: QuestionCategory }[] =
  [
    // Behavioral
    {
      text: "Tell me about a time you had to deal with a difficult team member. How did you handle it?",
      category: "behavioral",
    },
    {
      text: "Describe a situation where you failed. What did you learn from it?",
      category: "behavioral",
    },
    {
      text: "Give me an example of a time you went above and beyond what was expected of you.",
      category: "behavioral",
    },
    {
      text: "Tell me about a time you had to manage competing priorities under a tight deadline.",
      category: "behavioral",
    },
    {
      text: "Describe a situation where you received constructive criticism. How did you respond?",
      category: "behavioral",
    },

    // Technical
    {
      text: "Walk me through how you would design a scalable notification system for a large application.",
      category: "technical",
    },
    {
      text: "Explain the trade-offs between SQL and NoSQL databases. When would you choose one over the other?",
      category: "technical",
    },
    {
      text: "How would you approach debugging a production issue that only happens intermittently?",
      category: "technical",
    },
    {
      text: "Describe your approach to writing maintainable and testable code. Give a concrete example.",
      category: "technical",
    },
    {
      text: "What is your process for evaluating and adopting new technologies on a team?",
      category: "technical",
    },

    // Situational
    {
      text: "If you disagreed with your manager's technical decision, how would you handle it?",
      category: "situational",
    },
    {
      text: "Imagine you're given a project with unclear requirements. What steps would you take?",
      category: "situational",
    },
    {
      text: "How would you handle a situation where a critical feature deadline is at risk?",
      category: "situational",
    },
    {
      text: "If you discovered a security vulnerability in production, what would be your immediate steps?",
      category: "situational",
    },
    {
      text: "How would you onboard yourself to a large, unfamiliar codebase in the first two weeks?",
      category: "situational",
    },

    // Leadership
    {
      text: "How do you motivate a team during a challenging project or tight deadline?",
      category: "leadership",
    },
    {
      text: "Describe your approach to mentoring junior developers. Give a specific example.",
      category: "leadership",
    },
    {
      text: "How do you build trust with a new team when joining as a senior member?",
      category: "leadership",
    },
    {
      text: "Tell me about a time you had to make a tough decision that not everyone agreed with.",
      category: "leadership",
    },
    {
      text: "How do you balance technical debt with feature delivery? Describe your decision framework.",
      category: "leadership",
    },

    // Problem Solving
    {
      text: "Walk me through how you would approach optimizing a slow-performing database query.",
      category: "problem_solving",
    },
    {
      text: "Describe a complex problem you solved recently. What was your thought process?",
      category: "problem_solving",
    },
    {
      text: "How would you reduce the load time of a web application from 8 seconds to under 2 seconds?",
      category: "problem_solving",
    },
    {
      text: "If a microservice in your system started failing intermittently, how would you diagnose and fix it?",
      category: "problem_solving",
    },
    {
      text: "Describe how you would design an efficient caching strategy for a high-traffic API.",
      category: "problem_solving",
    },
  ];
