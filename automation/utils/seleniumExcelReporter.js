import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.resolve(__dirname, '../../Test Results');
const excelDir = path.join(reportsDir, 'Excel');

if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

// Styling Constants
const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
const headerFont = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
const cellFont = { name: 'Segoe UI', size: 10 };
const thinBorder = {
  top: { style: 'thin', color: { argb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
  left: { style: 'thin', color: { argb: 'CBD5E1' } },
  right: { style: 'thin', color: { argb: 'CBD5E1' } }
};

export async function generateSeleniumExcelReports(testCases, totalDuration) {
  const passed = testCases.filter(c => c.status === 'PASS');
  const failed = testCases.filter(c => c.status === 'FAIL');
  const skipped = testCases.filter(c => c.status === 'SKIP');
  
  // 1. GENERATE AUTOMATION_TEST_REPORT.XLSX
  const masterWb = new ExcelJS.Workbook();
  await addWebTestSheet(masterWb, 'Executed Test Cases', testCases);
  await addWebTestSheet(masterWb, 'Passed Tests', passed);
  await addWebTestSheet(masterWb, 'Failed Tests', failed);
  await addWebTestSheet(masterWb, 'Skipped Tests', skipped);
  await addWebMetricsSheet(masterWb, testCases, totalDuration);
  await addWebDefectSheet(masterWb, failed);
  
  const masterPath = path.join(excelDir, 'Automation_Test_Report.xlsx');
  await masterWb.xlsx.writeFile(masterPath);

  // 2. GENERATE PASSED_TEST_CASES.XLSX
  const passedWb = new ExcelJS.Workbook();
  await addWebTestSheet(passedWb, 'Passed Tests', passed);
  const passedPath = path.join(excelDir, 'Passed_Test_Cases.xlsx');
  await passedWb.xlsx.writeFile(passedPath);

  // 3. GENERATE FAILED_TEST_CASES.XLSX
  const failedWb = new ExcelJS.Workbook();
  await addWebTestSheet(failedWb, 'Failed Tests', failed);
  const failedPath = path.join(excelDir, 'Failed_Test_Cases.xlsx');
  await failedWb.xlsx.writeFile(failedPath);

  // 4. GENERATE SUMMARY_REPORT.XLSX
  const summaryWb = new ExcelJS.Workbook();
  await addWebMetricsSheet(summaryWb, testCases, totalDuration);
  const summaryPath = path.join(excelDir, 'Summary_Report.xlsx');
  await summaryWb.xlsx.writeFile(summaryPath);

  console.log(`Excel reports generated successfully in:\n  ${excelDir}`);
}

async function addWebTestSheet(wb, name, cases) {
  const ws = wb.addWorksheet(name);
  ws.views = [{ showGridLines: true }];

  // Banner
  ws.mergeCells('A1:F2');
  const banner = ws.getCell('A1');
  banner.value = `SMARTSTUDY AI - WEB ${name.toUpperCase()}`;
  banner.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  // Headers
  const headerIdx = 4;
  const headerRow = ws.getRow(headerIdx);
  headerRow.height = 24;
  headerRow.values = ['Test ID', 'Module', 'Test Name', 'Status', 'Execution Time', 'Priority'];

  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Data
  cases.forEach((c, idx) => {
    const rowNum = headerIdx + 1 + idx;
    const r = ws.getRow(rowNum);
    r.height = 20;
    r.values = [c.id, c.category, c.title, c.status, c.duration, c.severity];

    const rowBg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    r.eachCell((cell, colNum) => {
      cell.font = cellFont;
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.alignment = { vertical: 'middle' };

      if (colNum === 1 || colNum === 4 || colNum === 5 || colNum === 6) {
        cell.alignment.horizontal = 'center';
      }

      if (colNum === 4) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
        if (c.status === 'PASS') {
          cell.font.color = { argb: '16A34A' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        } else if (c.status === 'FAIL') {
          cell.font.color = { argb: 'DC2626' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else {
          cell.font.color = { argb: 'D97706' };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        }
      }
    });
  });

  ws.columns = [
    { key: 'id', width: 16 },
    { key: 'category', width: 22 },
    { key: 'title', width: 45 },
    { key: 'status', width: 14 },
    { key: 'duration', width: 18 },
    { key: 'severity', width: 14 }
  ];
}

async function addWebMetricsSheet(wb, cases, totalDuration) {
  const ws = wb.addWorksheet('Execution Metrics');
  ws.views = [{ showGridLines: true }];

  ws.mergeCells('A1:C2');
  const banner = ws.getCell('A1');
  banner.value = 'SMARTSTUDY AI - WEB PORTAL METRICS';
  banner.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const total = cases.length;
  const passed = cases.filter(c => c.status === 'PASS').length;
  const failed = cases.filter(c => c.status === 'FAIL').length;
  const skipped = cases.filter(c => c.status === 'SKIP').length;
  const successRate = ((passed / total) * 100).toFixed(2) + '%';
  const durationSec = (totalDuration / 1000).toFixed(2) + 's';

  const metrics = [
    ['Metric Parameter', 'Value'],
    ['Total Web Test Cases', total],
    ['Executed', total - skipped],
    ['Passed', passed],
    ['Failed', failed],
    ['Skipped', skipped],
    ['E2E Success Rate (%)', successRate],
    ['Total Duration', durationSec]
  ];

  metrics.forEach((rowVal, idx) => {
    const rowNum = 4 + idx;
    const r = ws.getRow(rowNum);
    r.height = 22;
    r.values = [rowVal[0], rowVal[1], ''];
    ws.mergeCells(`A${rowNum}:B${rowNum}`);

    const isHeader = idx === 0;
    r.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      if (isHeader) {
        cell.fill = headerFill;
        cell.font = headerFont;
        if (colNum === 3) cell.alignment = { horizontal: 'center' };
      } else {
        cell.font = cellFont;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' } };
        if (colNum === 3) {
          cell.alignment = { horizontal: 'center' };
          cell.font = { bold: true };
          if (rowVal[0].includes('Success Rate')) {
            cell.font.color = passed === total ? { argb: '16A34A' } : { argb: 'D97706' };
          }
        }
      }
      cell.alignment = { vertical: 'middle' };
    });
  });

  ws.columns = [{ width: 26 }, { width: 14 }, { width: 16 }];
}

async function addWebDefectSheet(wb, failedCases) {
  const ws = wb.addWorksheet('Defect Summary');
  ws.views = [{ showGridLines: true }];

  ws.mergeCells('A1:E2');
  const banner = ws.getCell('A1');
  banner.value = 'SMARTSTUDY AI - WEB DEFECT LOGS';
  banner.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7F1D1D' } };

  const headerIdx = 4;
  const headerRow = ws.getRow(headerIdx);
  headerRow.height = 24;
  headerRow.values = ['Test ID', 'Category', 'Test Name', 'Priority', 'Defect / Error Details'];

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '991B1B' } };
    cell.font = headerFont;
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  failedCases.forEach((c, idx) => {
    const rowNum = headerIdx + 1 + idx;
    const r = ws.getRow(rowNum);
    r.height = 22;
    r.values = [c.id, c.category, c.title, c.severity, c.details];

    r.eachCell((cell, colNum) => {
      cell.font = cellFont;
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFF5F5' : 'FFFFFF' } };
      cell.alignment = { vertical: 'middle' };

      if (colNum === 1 || colNum === 4) {
        cell.alignment.horizontal = 'center';
      }
      if (colNum === 5) {
        cell.font = { name: 'Segoe UI', color: { argb: '991B1B' }, size: 9, italic: true };
      }
    });
  });

  ws.columns = [
    { key: 'id', width: 14 },
    { key: 'category', width: 22 },
    { key: 'title', width: 35 },
    { key: 'severity', width: 14 },
    { key: 'details', width: 60 }
  ];
}
