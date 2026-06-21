export type Note = {
  id: number;
  title: string;
  subject: string;
  author: string;
  authorSlug: string;
  uploadedAt: string;
  pdf: string;
  preview: string;
  featured: boolean;
  views: number;
  downloads: number;
  classLevel: string;
  board: string;
  tags: string[];
};

export const notes: Note[] = [
  {
    id: 1,
    title: "Python Conditionals",
    subject: "Computer Science",
    author: "Jeet",
    authorSlug: "jeet",
    uploadedAt: "20 Jun 2026",
    pdf: "/pdfs/python-conditionals.pdf",
    preview: "/previews/python-conditionals.png",
    featured: true,
    views: 125,
    downloads: 42,
    classLevel: "11",
    board: "CBSE",
    tags: ["Python", "Conditionals"],
  },
  {
    id: 2,
    title: "Leap Year Program",
    subject: "Computer Science",
    author: "Jeet",
    authorSlug: "jeet",
    uploadedAt: "20 Jun 2026",
    pdf: "/pdfs/leap-year.pdf",
    preview: "/previews/leap-year.png",
    featured: true,
    views: 98,
    downloads: 31,
    classLevel: "11",
    board: "CBSE",
    tags: ["Python", "Leap Year", "if-else"],
  },
  {
    id: 3,
    title: "Menu Driven Calculator",
    subject: "Computer Science",
    author: "Aashi",
    authorSlug: "aashi",
    uploadedAt: "19 Jun 2026",
    pdf: "/pdfs/menu-driven-calculator.pdf",
    preview: "/previews/menu-driven-calculator.png",
    featured: false,
    views: 67,
    downloads: 20,
    classLevel: "11",
    board: "CBSE",
    tags: ["Python", "Menu", "Operators"],
  },
  {
    id: 4,
    title: "Economics Project",
    subject: "Economics",
    author: "Aditi",
    authorSlug: "aditi",
    uploadedAt: "19 Jun 2026",
    pdf: "/pdfs/economics-project.pdf",
    preview: "/previews/economics-project.png",
    featured: true,
    views: 142,
    downloads: 58,
    classLevel: "11",
    board: "CBSE",
    tags: ["Project", "Economics"],
  },
];