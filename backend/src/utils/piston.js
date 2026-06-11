const axios = require("axios");

const languageMap = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

const executeCode = async (language, code, stdin = "") => {
  try {
    const res = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: languageMap[language],
        stdin: stdin || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    return {
      stdout: res.data.stdout,
      stderr: res.data.stderr,
      code: res.data.status?.id,
    };
  } catch (err) {
    console.log("EXEC ERROR:", err.response?.data || err.message);

    return {
      stdout: "",
      stderr: "Execution Failed",
      code: 1,
    };
  }
};

module.exports = executeCode;