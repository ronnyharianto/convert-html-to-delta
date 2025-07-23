import { Client } from 'pg';
import { htmlToText } from 'html-to-text';

// Define table schema
interface RowData {
  id: number;
  html_content: string;
}

async function migrate() {
  const processUpdateDatabase = process.env.PROCESS_UPDATE_DATABASE === 'true';
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  });

  try {
    await client.connect();

    // Define the query to select records that need to convert HTML to Delta
    const selectQuery = `
      SELECT id, html_content
      FROM public."TABLE"
      WHERE 
        "id" IS NOT NULL
        AND "html_content" IS NOT NULL;
    `;
    const res = await client.query<RowData>(selectQuery);

    for (const row of res.rows) {
      try {
        const plainText = htmlToText(row.html_content, {
          wordwrap: false,
        });

        if (!processUpdateDatabase) {
          console.log(`Id: ${row.id}`);
          console.log(`Converted Job Description: ${plainText}`);
          console.log('-----------------------------------');
        }

        if (processUpdateDatabase) {
          await client.query(
            'UPDATE your_table SET plain_text = $1 WHERE id = $2',
            [plainText, row.id]
          );
        }

        console.log(`✅ Konversi Id ${row.id}`);
      } catch (err) {
        console.error(`❌ Gagal konversi Id ${row.id}:`, err);
      }
    }

    console.log('🚀 Semua data selesai dikonversi ke plain text.');
  } catch (err) {
    console.error('🚨 Error koneksi/query:', err);
  } finally {
    await client.end();
  }
}

migrate();
