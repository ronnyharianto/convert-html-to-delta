import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import { HtmlToDelta } from 'quill-delta-from-html';

// Define table schema
interface RecordRow {
  id: number;
  html_content: string;
}

async function convertHtmlToDelta() {
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
    console.log('🔌 Connected to database');

    // Define the query to select records that need to convert HTML to Delta
    const selectQuery = `
      SELECT id, html_content
      FROM public."TABLE"
      WHERE 
        "id" IS NOT NULL
        AND "html_content" IS NOT NULL;
    `;
    const res = await client.query<RecordRow>(selectQuery);

    for (const row of res.rows) {
      try {
        const converter = new HtmlToDelta();
        const delta = converter.convert(row.html_content);

        if (!processUpdateDatabase) {
          console.log(`Id: ${row.id}`);
          console.log(`Converted Job Description: ${JSON.stringify(delta)}`);
          console.log('-----------------------------------');
        }

        if (processUpdateDatabase) {
          await client.query(
            'UPDATE public."TABLE" SET "html_content" = $1 WHERE "id" = $2',
            [JSON.stringify(delta), row.id]
          );
        }

        console.log(`✅ Migrated Id ${row.id}`);
      } catch (err) {
        console.error(`❌ Failed to convert Id ${row.id}:`, err);
      }
    }

    console.log('✅ All done!');
  } catch (err) {
    console.error('🚨 Connection or query error:', err);
  } finally {
    await client.end();
  }
}

convertHtmlToDelta();
