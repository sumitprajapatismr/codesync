const Problem = require("../models/Problem");
const User = require("../models/User");
const executeCode = require("../utils/piston");

// ======================
// RUN CODE
// ======================
exports.runCode = async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "language and code required",
      });
    }

    const safeInput = stdin || "";

    const result = await executeCode(language, code, safeInput);

    return res.json({
      success: true,
      data: {
        stdout: result?.stdout || "",
        stderr: result?.stderr || "",
        code: result?.code ?? 0,
      },
    });

  } catch (err) {
    console.log("🔥 RUN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Execution failed",
      error: err.message,
    });
  }
};

// ======================
// SUBMIT CODE
// ======================
exports.submitCode = async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    return res.status(400).json({
      success: false,
      message: "problemId, code, language required",
    });
  }

  try {
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No test cases found",
      });
    }

    // ======================
    // SMART NORMALIZER (FIXED)
    // ======================
    const normalize = (str) => {
      return (str || "")
        .toString()
        .trim()
        .replace(/\r/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const results = [];
    let overallPassed = true;
    let overallStatus = "Accepted";

    for (const tc of problem.testCases) {
      const runResult = await executeCode(language, code, tc.input);

      const stdout = runResult.stdout || "";
      const exitCode = runResult.code ?? 0;

      const isMatch =
        normalize(stdout) === normalize(tc.expectedOutput);

      let status = "Accepted";

      if (exitCode !== 0) {
        status = "Runtime Error";
        overallPassed = false;
        overallStatus = "Runtime Error";
      } else if (!isMatch) {
        status = "Wrong Answer";
        overallPassed = false;
        overallStatus = "Wrong Answer";
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: stdout,
        passed: isMatch && exitCode === 0,
        status,
      });
    }

    // ======================
    // USER UPDATE
    // ======================
    const userId = req.user?.id || req.user?._id;

    if (userId && overallPassed) {
      const user = await User.findById(userId);

      if (user) {
        const pointsMap = {
          Easy: 10,
          Medium: 20,
          Hard: 30,
        };

        const points = pointsMap[problem.difficulty] || 10;

        const alreadySolved = user.solvedProblems?.some(
          (id) => id.toString() === problemId.toString()
        );

        if (!alreadySolved) {
          await User.findByIdAndUpdate(userId, {
            $inc: { score: points },
            $push: { solvedProblems: problemId },
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        passed: overallPassed,
        status: overallStatus,
        results,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
};