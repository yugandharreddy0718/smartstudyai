import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure output directories exist
const reportsDir = path.resolve(__dirname, '../../Test Results/Mobile');
const excelDir = path.join(reportsDir, 'Excel');

if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

// Styling Helper Constants
const slateHeaderFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '1E293B' } // Slate-800
};
const headerFont = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
const cellFont = { name: 'Segoe UI', size: 10 };
const thinBorder = {
  top: { style: 'thin', color: { argb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
  left: { style: 'thin', color: { argb: 'CBD5E1' } },
  right: { style: 'thin', color: { argb: 'CBD5E1' } }
};

export async function generateExcelReports(testCases, totalDuration) {
  // Filter lists
  const passedCases = testCases.filter(c => c.status === 'PASS');
  const failedCases = testCases.filter(c => c.status === 'FAIL');
  const skippedCases = testCases.filter(c => c.status === 'SKIP');
  const blockedCases = testCases.filter(c => c.status === 'BLOCKED');
  
  // 1. GENERATE AUTOMATION_TEST_REPORT.XLSX (7 sheets)
  const masterWorkbook = new ExcelJS.Workbook();
  
  // Setup standard sheets
  await addTestListSheet(masterWorkbook, 'Executed Test Cases', testCases);
  await addTestListSheet(masterWorkbook, 'Passed Tests', passedCases);
  await addTestListSheet(masterWorkbook, 'Failed Tests', failedCases);
  await addTestListSheet(masterWorkbook, 'Skipped Tests', skippedCases);
  await addMetricsSheet(masterWorkbook, testCases, totalDuration);
  await addDefectSummarySheet(masterWorkbook, failedCases);
  await addPassRateSummarySheet(masterWorkbook, testCases);
  
  const masterPath = path.join(excelDir, 'Automation_Test_Report.xlsx');
  await masterWorkbook.xlsx.writeFile(masterPath);

  // 2. GENERATE PASSED_TEST_CASES.XLSX
  const passedWorkbook = new ExcelJS.Workbook();
  await addTestListSheet(passedWorkbook, 'Passed Test Cases', passedCases);
  const passedPath = path.join(excelDir, 'Passed_Test_Cases.xlsx');
  await passedWorkbook.xlsx.writeFile(passedPath);

  // 3. GENERATE FAILED_TEST_CASES.XLSX
  const failedWorkbook = new ExcelJS.Workbook();
  await addTestListSheet(failedWorkbook, 'Failed Test Cases', failedCases);
  const failedPath = path.join(excelDir, 'Failed_Test_Cases.xlsx');
  await failedWorkbook.xlsx.writeFile(failedPath);

  // 4. GENERATE EXECUTION_SUMMARY.XLSX
  const summaryWorkbook = new ExcelJS.Workbook();
  await addMetricsSheet(summaryWorkbook, testCases, totalDuration);
  const summaryPath = path.join(excelDir, 'Execution_Summary.xlsx');
  await summaryWorkbook.xlsx.writeFile(summaryPath);

  console.log(`Excel reports generated successfully in:\n  ${excelDir}`);
}

// Helper: Add list sheets (Sheet 1 - 4)
async function addTestListSheet(workbook, name, cases) {
  const ws = workbook.addWorksheet(name);
  ws.views = [{ showGridLines: true }];
  
  // Merged title banner
  ws.mergeCells('A1:F2');
  const titleCell = ws.getCell('A1');
  titleCell.value = `SMARTSTUDY AI - ${name.toUpperCase()}`;
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  ws.getRow(3).height = 15; // Spacer row

  // Table Headers
  const headerRowIdx = 4;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 24;
  headerRow.values = ['Test ID', 'Module', 'Test Name', 'Priority', 'Status', 'Execution Time (ms)'];
  
  headerRow.eachCell((cell) => {
    cell.fill = slateHeaderFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = thinBorder;
  });

  // Populate data
  cases.forEach((c, idx) => {
    const rIdx = headerRowIdx + 1 + idx;
    const r = ws.getRow(rIdx);
    r.height = 20;
    r.values = [c.id, c.module, c.name, c.priority, c.status, c.duration];
    
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? 'FFFFFF' : 'F8FAFC';
    
    r.eachCell((cell, colNum) => {
      cell.font = cellFont;
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.alignment = { vertical: 'middle' };

      if (colNum === 1 || colNum === 4 || colNum === 6) {
        cell.alignment.horizontal = 'center';
      }

      if (colNum === 5) {
        cell.alignment.horizontal = 'center';
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
        if (c.status === 'PASS') {
          cell.font.color = { argb: '16A34A' }; // Green
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        } else if (c.status === 'FAIL') {
          cell.font.color = { argb: 'DC2626' }; // Red
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else {
          cell.font.color = { argb: 'D97706' }; // Amber
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        }
      }
    });
  });

  // Autofit column widths
  ws.columns = [
    { key: 'id', width: 15 },
    { key: 'module', width: 22 },
    { key: 'name', width: 45 },
    { key: 'priority', width: 14 },
    { key: 'status', width: 14 },
    { key: 'duration', width: 22 }
  ];
}

// Helper: Add metrics sheet (Sheet 5)
async function addMetricsSheet(workbook, cases, totalDuration) {
  const ws = workbook.addWorksheet('Execution Metrics');
  ws.views = [{ showGridLines: true }];

  // Banner
  ws.mergeCells('A1:D2');
  const banner = ws.getCell('A1');
  banner.value = 'SMARTSTUDY AI - TESTING PERFORMANCE METRICS';
  banner.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  // Calculate metrics
  const total = cases.length;
  const passed = cases.filter(c => c.status === 'PASS').length;
  const failed = cases.filter(c => c.status === 'FAIL').length;
  const skipped = cases.filter(c => c.status === 'SKIP').length;
  const blocked = cases.filter(c => c.status === 'BLOCKED').length;
  const successRate = ((passed / total) * 100).toFixed(2) + '%';
  const durationSec = (totalDuration / 1000).toFixed(2) + 's';

  const metricsData = [
    ['Metric Description', 'Value'],
    ['Total Test Cases', total],
    ['Executed', total - skipped],
    ['Passed', passed],
    ['Failed', failed],
    ['Skipped', skipped],
    ['Blocked', blocked],
    ['Overall Pass Rate (%)', successRate],
    ['Total Execution Duration', durationSec]
  ];

  metricsData.forEach((rowVal, idx) => {
    const rowNum = 4 + idx;
    const r = ws.getRow(rowNum);
    r.height = 22;
    r.values = [rowVal[0], rowVal[1], '', ''];
    ws.mergeCells(`A${rowNum}:C${rowNum}`);

    const isHeader = idx === 0;
    r.eachCell((cell, colNum) => {
      cell.border = thinBorder;
      if (isHeader) {
        cell.fill = slateHeaderFill;
        cell.font = headerFont;
        if (colNum === 4) cell.alignment = { horizontal: 'center' };
      } else {
        cell.font = cellFont;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' } };
        if (colNum === 4) {
          cell.alignment = { horizontal: 'center' };
          cell.font = { bold: true };
          if (rowVal[0].includes('Pass Rate')) {
            cell.font.color = passed === total ? { argb: '16A34A' } : { argb: 'D97706' };
          }
        }
      }
      cell.alignment = { vertical: 'middle' };
    });
  });

  ws.columns = [{ width: 22 }, { width: 14 }, { width: 14 }, { width: 18 }];
}

// Helper: Add defect summary sheet (Sheet 6)
async function addDefectSummarySheet(workbook, failedCases) {
  const ws = workbook.addWorksheet('Defect Summary');
  ws.views = [{ showGridLines: true }];

  ws.mergeCells('A1:E2');
  const banner = ws.getCell('A1');
  banner.value = 'SMARTSTUDY AI - AUTOMATION DEFECT SUMMARY';
  banner.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7F1D1D' } }; // Dark Red Banner

  const headerRowIdx = 4;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 24;
  headerRow.values = ['Test ID', 'Module', 'Test Name', 'Execution Time (ms)', 'Failure Details / Reason'];

  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '991B1B' } }; // Red header
    cell.font = headerFont;
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  failedCases.forEach((c, idx) => {
    const rIdx = headerRowIdx + 1 + idx;
    const r = ws.getRow(rIdx);
    r.height = 22;
    r.values = [c.id, c.module, c.name, c.duration, c.details];

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
    { key: 'module', width: 22 },
    { key: 'name', width: 40 },
    { key: 'duration', width: 22 },
    { key: 'details', width: 55 }
  ];
}

// Helper: Add pass rate summary sheet (Sheet 7)
async function addPassRateSummarySheet(workbook, cases) {
  const ws = workbook.addWorksheet('Pass Rate Summary');
  ws.views = [{ showGridLines: true }];

  ws.mergeCells('A1:F2');
  const banner = ws.getCell('A1');
  banner.value = 'SMARTSTUDY AI - COMPONENT PASS RATE ANALYSIS';
  banner.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  banner.alignment = { vertical: 'middle', horizontal: 'center' };
  banner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const headerRowIdx = 4;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 24;
  headerRow.values = ['Module Name', 'Total Cases', 'Passed', 'Failed', 'Skipped', 'Pass Rate (%)'];

  headerRow.eachCell((cell) => {
    cell.fill = slateHeaderFill;
    cell.font = headerFont;
    cell.border = thinBorder;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  // Group stats by module
  const modules = [...new Set(cases.map(c => c.module))];
  modules.forEach((mod, idx) => {
    const modCases = cases.filter(c => c.module === mod);
    const total = modCases.length;
    const passed = modCases.filter(c => c.status === 'PASS').length;
    const failed = modCases.filter(c => c.status === 'FAIL').length;
    const skipped = modCases.filter(c => c.status === 'SKIP').length;
    const passRate = ((passed / total) * 100).toFixed(1) + '%';

    const rIdx = headerRowIdx + 1 + idx;
    const r = ws.getRow(rIdx);
    r.height = 22;
    r.values = [mod, total, passed, failed, skipped, passRate];

    r.eachCell((cell, colNum) => {
      cell.font = cellFont;
      cell.border = thinBorder;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' } };
      cell.alignment = { vertical: 'middle' };

      if (colNum >= 2 && colNum <= 6) {
        cell.alignment.horizontal = 'center';
      }

      if (colNum === 6) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
        cell.font.color = passed === total ? { argb: '16A34A' } : { argb: 'D97706' };
      }
    });
  });

  ws.columns = [
    { key: 'module', width: 25 },
    { key: 'total', width: 14 },
    { key: 'passed', width: 12 },
    { key: 'failed', width: 12 },
    { key: 'skipped', width: 12 },
    { key: 'rate', width: 16 }
  ];
}
