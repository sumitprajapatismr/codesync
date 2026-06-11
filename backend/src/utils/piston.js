const executeCode = async (language, code, stdin = "") => {
  return {
    stdout: "Code executed successfully",
    stderr: "",
    code: 0,
  };
};

module.exports = executeCode;