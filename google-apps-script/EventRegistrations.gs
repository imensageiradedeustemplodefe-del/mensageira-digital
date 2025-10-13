// Google Apps Script para gerenciar Inscrições de Eventos
// Deploy este script como Web App e use o URL no Lovable

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { eventTitle, registrations, fields } = data;
    
    // Nome da pasta principal
    const mainFolderName = "Inscrições_Eventos";
    
    // Buscar ou criar a pasta principal
    let mainFolder = getOrCreateFolder(mainFolderName);
    
    // Nome da planilha baseado no evento
    const spreadsheetName = `Inscrições - ${eventTitle} - ${new Date().toLocaleDateString('pt-BR')}`;
    
    // Buscar ou criar a planilha
    let spreadsheet = getOrCreateSpreadsheet(spreadsheetName, mainFolder);
    let sheet = spreadsheet.getActiveSheet();
    
    // Se a planilha está vazia, adicionar cabeçalhos
    if (sheet.getLastRow() === 0) {
      const headers = fields.map(f => f.field_label);
      headers.push("Data de Inscrição");
      sheet.appendRow(headers);
      
      // Formatar cabeçalho
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#4285f4");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    // Adicionar as inscrições
    registrations.forEach(reg => {
      const row = fields.map(field => reg.registration_data[field.field_name] || "");
      row.push(new Date(reg.created_at).toLocaleString("pt-BR"));
      sheet.appendRow(row);
    });
    
    // Auto-ajustar colunas
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        spreadsheetId: spreadsheet.getId(),
        spreadsheetUrl: spreadsheet.getUrl(),
        syncedCount: registrations.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(folderName, parentFolder) {
  const parent = parentFolder || DriveApp.getRootFolder();
  const folders = parent.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

function getOrCreateSpreadsheet(name, folder) {
  // Buscar planilhas existentes com o mesmo nome na pasta
  const files = folder.getFilesByName(name);
  
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  } else {
    // Criar nova planilha
    const spreadsheet = SpreadsheetApp.create(name);
    const file = DriveApp.getFileById(spreadsheet.getId());
    
    // Mover para a pasta correta
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    return spreadsheet;
  }
}

// Função para testar (executar manualmente no editor)
function test() {
  const testData = {
    eventTitle: "Teste de Evento",
    fields: [
      { field_name: "nome", field_label: "Nome Completo" },
      { field_name: "email", field_label: "Email" }
    ],
    registrations: [
      {
        registration_data: {
          nome: "João Silva",
          email: "joao@example.com"
        },
        created_at: new Date().toISOString()
      }
    ]
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}
