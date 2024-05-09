const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("node:path"); 

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile("index.html");
});

ipcMain.on("process-csv", (event, filePath) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      event.sender.send("csv-error", err.message);
      return;
    }

    const dataArray = data.trim().split('\n').map(row => row.split(';'));
    const headers = dataArray[0];
    const rows = dataArray.slice(1);

    const columnCount = headers.length;
    let isValid = true;
    rows.forEach(row => {
      if (row.length !== columnCount) {
        isValid = false;
      }
    });

    if (!isValid) {
      event.sender.send("csv-error", "Кількість стовпців у різних рядках не співпадає.");
      return;
    }

    const csvData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    event.sender.send("csv-data", csvData);
  });
});

ipcMain.on("save-changes", (event, { filePath, data }) => {
  let csvContent = '';
  
  const headers = Object.keys(data[0]);
  csvContent += headers.join(';') + '\n';

  
  data.forEach(row => {
    const values = headers.map(header => row[header]);
    csvContent += values.join(';') + '\n';
  });

  fs.writeFile(filePath, csvContent, (err) => {
    if (err) {
      event.sender.send("csv-error", err.message);
      return;
    }
    console.log("Changes saved successfully!");
  });
});

