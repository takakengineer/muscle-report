import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// 静的ファイル配信
// app.use(express.static(path.join(__dirname, "../client/dist")));

app.post("/api/submit", async (req, res) => {
  const notionUrl = "https://api.notion.com/v1/pages";
  const notionToken = process.env.NOTION_API_KEY;
  const notionVersion = process.env.NOTION_API_VERSION;

  const payload = {
    parent: {
      database_id: process.env.NOTION_DATABASE_ID,
    },
    properties: req.body.properties,
  };

  try {
    const notionRes = await fetch(notionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": notionVersion,
      },
      body: JSON.stringify(payload),
    });

    if (!notionRes.ok) {
      const errorData = await notionRes.json();
      console.error("❌ Notion API エラー:", errorData);
      return res
        .status(notionRes.status)
        .json({ error: "Notion API送信エラー", detail: errorData });
    }

    const responseData = await notionRes.json();
    console.log("✅ Notion送信成功:", responseData);
    res.status(200).json({ message: "Notion送信成功", data: responseData });
  } catch (error) {
    console.error("❌ サーバーでエラー:", error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// どのルートでもindex.htmlを返す（React Router対応）
// 正しいパス指定に直す！
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
});
