# 🔁 Convert HTML to Quill Delta Format

This project is used to **convert HTML content (typically from WYSIWYG editors)** into the [Quill Delta](https://quilljs.com/docs/delta/) format and update it in a PostgreSQL database.

---

## 🔧 Requirements

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Project Structure

project-root/
├── src/
│ └── convert-html-to-delta.ts # Main migration script
├── .env # Environment variables
├── .env.example # Environment variables example
├── package.json # Node.js project config
├── tsconfig.json # TypeScript config
└── README.md # Project documentation

---

## ⚙️ Setup & Installation

1. **Clone this repository**

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

2. Create a `.env` file in the root directory with your environment.

3. Install dependencies

```bash
npm install
```

4. Run the migration script

```bash
npx ts-node src/convert-html-to-delta.ts
```

## 🧪 What It Does

- Connects to the PostgreSQL database using credentials from `.env`.
- Retrieves records from the specified table and column containing HTML content.
- Converts each HTML string to Quill Delta format using `quill-delta-from-html`.
- Updates the original record in the database with the Delta format.

## 🛡️ Notes

- Ensure your HTML content is valid and compatible with Quill’s supported tags.
- Always test on a development/staging database before applying changes in production.
- Add `.env` to `.gitignore` to avoid leaking credentials.

## ✅ Example Output

```pgsql
🔌 Connected to database
✅ Migrated ID: 101
✅ Migrated ID: 102
🎉 Migration completed successfully
🔒 Connection closed
```
