const mongoose = require("mongoose");
const Problem = require("./src/models/Problem");

mongoose.connect("mongodb://localhost:27017/codesync");

async function updateProblems() {

  await Problem.updateOne(
    { title: "Two Sum" },
    {
      $set: {
        description: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Return the answer in any order.`,
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9"
        ],
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "nums[0] + nums[1] = 9"
          }
        ]
      }
    }
  );

  await Problem.updateOne(
    { title: "Reverse Integer" },
    {
      $set: {
        description: `Given a signed 32-bit integer x, return x with its digits reversed.

If reversing x causes the value to go outside the signed 32-bit integer range, return 0.`,
        constraints: [
          "-2^31 <= x <= 2^31 - 1"
        ],
        examples: [
          {
            input: "123",
            output: "321",
            explanation: "Digits are reversed."
          }
        ]
      }
    }
  );

  await Problem.updateOne(
    { title: "Valid Parentheses" },
    {
      $set: {
        description: `Given a string s containing the characters '(', ')', '{', '}', '[' and ']'.

Determine whether the input string is valid.

An input string is valid if brackets are closed by the same type and in the correct order.`,
        constraints: [
          "1 <= s.length <= 10^4"
        ],
        examples: [
          {
            input: "()[]{}",
            output: "true",
            explanation: "All brackets are properly matched."
          }
        ]
      }
    }
  );

  await Problem.updateOne(
    { title: "Maximum Subarray" },
    {
      $set: {
        description: `Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.`,
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^4 <= nums[i] <= 10^4"
        ],
        examples: [
          {
            input: "[-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            explanation: "Subarray [4,-1,2,1] has the largest sum."
          }
        ]
      }
    }
  );

  await Problem.updateOne(
    { title: "Number of Islands" },
    {
      $set: {
        description: `Given an m x n grid of '1's (land) and '0's (water), return the number of islands.

An island is formed by connecting adjacent lands horizontally or vertically.`,
        constraints: [
          "1 <= m, n <= 300",
          "grid[i][j] is '0' or '1'"
        ],
        examples: [
          {
            input: "[['1','1','0'],['1','0','0'],['0','0','1']]",
            output: "2",
            explanation: "There are two separate islands."
          }
        ]
      }
    }
  );

  console.log("✅ Top 5 Problems Updated Successfully");
  process.exit();
}

updateProblems();