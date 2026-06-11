const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: String,

  description: String,   // real statement

  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"]
  },

  tags: [String],

  constraints: [String],

  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],

  // ⭐ THIS IS MOST IMPORTANT FOR REAL CODING PRACTICE
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },

  testCases: [
    {
      input: String,
      expectedOutput: String,
      hidden: Boolean
    }
  ]
});

module.exports = mongoose.model("Problem", problemSchema);