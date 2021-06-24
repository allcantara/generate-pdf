const express = require("express");
const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const pdf = require("html-pdf");

const app = express();
app.use(express.json());

const passengers = [
  { name: "Ana Caroline", flightNumber: 7959, time: "18:00" },
  { name: "Bruno Alcântara", flightNumber: 7959, time: "18:00" },
  { name: "Davi Leonardo", flightNumber: 7959, time: "18:00" },
];

app.get("/pdf", async (request, response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3333/", {
    waitUntil: "networkidle0",
  });

  const pdf = await page.pdf({
    printBackground: true,
    format: "letter",
    margin: {
      top: "20px",
      bottom: "40px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  response.contentType("application/pdf");

  return response.send(pdf);
});

app.get("/", (request, response) => {
  const filePath = path.join(__dirname, "print.ejs");

  ejs.renderFile(filePath, { passengers }, (error, html) => {
    if (error) {
      return response.send("Falha na leitura do arquivo!");
    }

    savePdf(html);

    return response.send(html);
  });
});

function savePdf(html) {
  const options = {
    height: "11.25in",
    width: "8.5in",
    header: {
      height: "20mm",
    },
    footer: {
      height: "20mm",
    },
  };

  pdf.create(html, options).toFile("report.pdf", (error, _) => {
    if (error) {
      throw new Error("Falha na gerar PDF!");
    }
  });
}

app.listen(3333, () => console.log("Server running!!!"));
