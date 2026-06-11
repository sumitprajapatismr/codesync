require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'Easy',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    tags: ['Array', 'Hash Table'],
    defaultCodeTemplates: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your C++ code here\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java code here\n        return new int[0];\n    }\n}`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your Python code here\n        return []`,
      javascript: `function twoSum(nums, target) {\n    // Write your JavaScript code here\n    return [];\n}`,
    },
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expectedOutput: '[0,1]',
        isPublic: true,
      },
      {
        input: '[3,2,4]\n6',
        expectedOutput: '[1,2]',
        isPublic: true,
      },
      {
        input: '[3,3]\n6',
        expectedOutput: '[0,1]',
        isPublic: false,
      },
    ],
  },
  {
    title: 'Reverse Integer',
    description: 'Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return `0`.',
    difficulty: 'Medium',
    constraints: [
      '-2^31 <= x <= 2^31 - 1',
    ],
    examples: [
      {
        input: 'x = 123',
        output: '321',
      },
      {
        input: 'x = -123',
        output: '-321',
      },
      {
        input: 'x = 120',
        output: '21',
      },
    ],
    tags: ['Math'],
    defaultCodeTemplates: {
      cpp: `class Solution {\npublic:\n    int reverse(int x) {\n        // Write your C++ code here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int reverse(int x) {\n        // Write your Java code here\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def reverse(self, x: int) -> int:\n        # Write your Python code here\n        return 0`,
      javascript: `function reverse(x) {\n    // Write your JavaScript code here\n    return 0;\n}`,
    },
    testCases: [
      {
        input: '123',
        expectedOutput: '321',
        isPublic: true,
      },
      {
        input: '-123',
        expectedOutput: '-321',
        isPublic: true,
      },
      {
        input: '120',
        expectedOutput: '21',
        isPublic: false,
      },
      {
        input: '1534236469',
        expectedOutput: '0', // Overflow test
        isPublic: false,
      },
    ],
  },
  {
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
    difficulty: 'Hard',
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6',
    ],
    examples: [
      {
        input: 'nums1 = [1,3], nums2 = [2]',
        output: '2.00000',
        explanation: 'merged array = [1,2,3] and median is 2.',
      },
      {
        input: 'nums1 = [1,2], nums2 = [3,4]',
        output: '2.50000',
        explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    defaultCodeTemplates: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your C++ code here\n        return 0.0;\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your Java code here\n        return 0.0;\n    }\n}`,
      python: `class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        # Write your Python code here\n        return 0.0`,
      javascript: `function findMedianSortedArrays(nums1, nums2) {\n    // Write your JavaScript code here\n    return 0.0;\n}`,
    },
    testCases: [
      {
        input: '[1,3]\n[2]',
        expectedOutput: '2.0',
        isPublic: true,
      },
      {
        input: '[1,2]\n[3,4]',
        expectedOutput: '2.5',
        isPublic: true,
      },
      {
        input: '[]\n[1]',
        expectedOutput: '1.0',
        isPublic: false,
      },
    ],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codesync';
    console.log('Connecting to URI:', mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB Connected for seeding.');

    // Clear existing
    await Problem.deleteMany({});
    console.log('Cleared existing problems.');

    // Insert new
    await Problem.insertMany(problems);
    console.log('Seeded database with coding problems successfully.');

    mongoose.connection.close();
    console.log('DB Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
