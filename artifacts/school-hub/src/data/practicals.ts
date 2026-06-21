export const practicals = [
  {
    id: 1,
    practicalNo: 1,
    title: "Python Conditionals",
    author: "Jeet",
    subject: "Computer Science",
    aim: "To study and implement conditional statements in Python.",
    algorithm: [
      "Input a number",
      "Check whether the number is greater than 0",
      "Display Positive if condition is true",
      "Otherwise display Negative",
    ],
    code: `num = int(input("Enter number: "))

if num > 0:
    print("Positive")
else:
    print("Negative")`,
    output: `Enter number: 10
Positive`,
    commonErrors: [
      "Using = instead of ==",
      "Forgetting the colon after if",
      "Incorrect indentation",
    ],
    viva: [
      {
        question: "What is an if statement?",
        answer:
          "An if statement is a decision-making statement that executes a block of code when a condition is True.",
      },
      {
        question: "What is the difference between if and elif?",
        answer:
          "if checks the first condition, while elif is used to check additional conditions if previous conditions are False.",
      },
      {
        question: "Why is indentation important in Python?",
        answer:
          "Indentation defines code blocks in Python and is mandatory for proper execution.",
      },
    ],
    tags: ["Python", "Conditional"],
    views: 125,
    downloads: 42,
  },
];
