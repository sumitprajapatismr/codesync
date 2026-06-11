export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    monaco: 'javascript',
    template: `// Write your JavaScript code here\nfunction solve() {\n    console.log("Hello from JavaScript!");\n}\nsolve();\n`,
  },
  {
    id: 'python',
    name: 'Python',
    monaco: 'python',
    template: `# Write your Python code here\ndef solve():\n    print("Hello from Python!")\n\nsolve()\n`,
  },
  {
    id: 'cpp',
    name: 'C++',
    monaco: 'cpp',
    template: `// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}\n`,
  },
  {
    id: 'java',
    name: 'Java',
    monaco: 'java',
    template: `// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n`,
  },
];

export const getLanguageTemplate = (langId) => {
  const lang = LANGUAGES.find((l) => l.id === langId);
  return lang ? lang.template : '';
};
