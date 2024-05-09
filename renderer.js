let csvData = []; 
let currentFilePath = ''; 

document.getElementById('fileInput').addEventListener('change', () => {
    const filePath = document.getElementById('fileInput').files[0].path;
    console.log(filePath);
    currentFilePath = filePath; 
    electron.send('process-csv', filePath);
});

electron.receive('csv-data', (data) => {
    console.log(data);
    csvData = data;
    displayTable(csvData);
});

electron.receive('csv-error', (errorMessage) => {
    alert(errorMessage); 
});

const fileInputLabel = document.getElementById('fileInputLabel');
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', () => {
    const fileName = fileInput.files[0].name;
    fileInputLabel.textContent = fileName; 
});

document.getElementById('createTableBtn').addEventListener('click', () => {
    fileInputLabel.textContent = 'Оберіть файл'; 
});

function displayTable(data) {
    let table = '<table id="dataTable">';
    table += '<thead><tr>';
    for (let header in data[0]) {
        table += `<th>${header}</th>`;
    }
    table += '</tr></thead><tbody>';
    data.forEach((row, rowIndex) => {
        table += '<tr>';
        for (let value in row) {
            table += `<td contenteditable="true" data-row="${rowIndex}" data-column="${value}">${row[value]}</td>`;
        }
        table += '</tr>';
    });
    table += '</tbody></table>';
    document.getElementById('tableContainer').innerHTML = table;

    
    const tableCells = document.querySelectorAll('#dataTable td');
    tableCells.forEach(cell => {
        cell.addEventListener('blur', (event) => {
            const row = event.target.getAttribute('data-row');
            const column = event.target.getAttribute('data-column');
            const newValue = event.target.innerText;
            csvData[row][column] = newValue; 
            document.getElementById('saveChangesBtn').style.display = 'block'; 
        });
    });
}

function clearFilePath() {
    document.getElementById('fileInput').value = ''; 
}

function createEmptyTable(rows, columns) {
    const newData = [];
    for (let i = 0; i < rows; i++) {
        const newRow = {};
        for (let j = 0; j < columns; j++) {
            newRow[`Column ${j + 1}`] = ''; 
        }
        newData.push(newRow);
    }
    return newData;
}

document.getElementById('createTableBtn').addEventListener('click', () => {
    clearFilePath(); 
    currentFilePath = ''; 
    csvData = createEmptyTable(5, 5); 
    displayTable(csvData);
});

document.getElementById('saveChangesBtn').addEventListener('click', () => {
    const filePath = currentFilePath || document.getElementById('fileInput').files[0]?.path; 
    if (!filePath) {
        const fileName = `New_file_${Date.now()}.csv`;
        electron.send('save-changes', { filePath: fileName, data: csvData });
        currentFilePath = fileName; 
    } else {
        electron.send('save-changes', { filePath, data: csvData });
    }
    document.getElementById('saveChangesBtn').style.display = 'none';
});
