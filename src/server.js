import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = 8080;

app.use(cors());

app.get("/alerts", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json",
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://www.oref.org.il/",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const text = await response.text();

    console.log("pikud-data", text);

    const data = text.trim() ? JSON.parse(text ?? {}) : {}; // Ensure text is not empty
    res.json(data);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
