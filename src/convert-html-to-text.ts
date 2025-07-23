import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import { htmlToText } from 'html-to-text';
import { isHtml } from './lib/validate';

// Define table schema
interface RowData {
  Id: number;
  HtmlContent: string;
  TableName: string;
  FieldName: string;
}

async function convertHtmlToText() {
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
      (
        SELECT "Id", "FIELD1" AS "HtmlContent", 'TABLE1' AS "TableName", 'FIELD1' AS "FieldName"
        FROM public."TABLE1"
        WHERE "FIELD1" ~ '<\/?[a-zA-Z]+[^>]*>'
      )
      UNION ALL
      (
        SELECT "Id", "FIELD2" AS "HtmlContent", 'TABLE2' AS "TableName", 'FIELD2' AS "FieldName"
        FROM public."TABLE2"
        WHERE "FIELD2" ~ '<\/?[a-zA-Z]+[^>]*>'
      );
    `;
    const res = await client.query<RowData>(selectQuery);

    for (const row of res.rows) {
      try {
        if (!row.HtmlContent || !isHtml(row.HtmlContent)) {
          console.log(`Content: ${row.HtmlContent}`);
          console.log(`⚠️  Skip Id ${row.Id} karena konten bukan HTML.`);
          console.log('-----------------------------------');

          continue;
        }

        const plainText = htmlToText(row.HtmlContent, {
          wordwrap: false,
        });

        if (!processUpdateDatabase) {
          console.log(`Converted Content: ${plainText}`);
          console.log('-----------------------------------');
        }

        if (processUpdateDatabase) {
          const query = `UPDATE public."${row.TableName}" SET "${row.FieldName}" = $1 WHERE "Id" = $2`;
          const values = [plainText, row.Id];
          await client.query(query, values);
        }

        console.log(`✅ Konversi Id ${row.Id}`);
        console.log(``);
      } catch (err) {
        console.error(`❌ Gagal konversi Id ${row.Id}:`, err);
        console.log(``);
      }
    }

    console.log('🚀 Semua data selesai dikonversi ke plain text.');
  } catch (err) {
    console.error('🚨 Error koneksi/query:', err);
  } finally {
    await client.end();
  }
}

convertHtmlToText();
