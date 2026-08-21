import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSeleniumReports(results, totalDuration) {
  // Ensure selenium-tests directories exist
  const baseDir = path.resolve(__dirname, '..');
  const reportsDir = path.join(baseDir, 'reports');
  const excelDir = path.join(baseDir, 'excel');
  const screenshotsDir = path.join(baseDir, 'screenshots');
  const logsDir = path.join(baseDir, 'logs');

  [reportsDir, excelDir, screenshotsDir, logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const excelPath = path.join(excelDir, 'selenium-report.xlsx');
  const htmlPath = path.join(reportsDir, 'index.html');
  const htmlPathAlt = path.join(reportsDir, 'selenium-report.html');

  const workbook = new ExcelJS.Workbook();

  // SHEET 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.views = [{ showGridLines: true }];

  summarySheet.mergeCells('A1:F2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'SMARTSTUDY AI - SELENIUM WEB E2E AUTOMATION REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  const passRate = results.length > 0 ? ((passed / results.length) * 100).toFixed(1) : '0.0';

  summarySheet.addRow([]);
  summarySheet.addRow(['Metric', 'Value']);
  summarySheet.getRow(4).font = { bold: true };
  summarySheet.addRow(['Total Tests', results.length]);
  summarySheet.addRow(['Passed Tests', passed]);
  summarySheet.addRow(['Failed Tests', failed]);
  summarySheet.addRow(['Skipped Tests', skipped]);
  summarySheet.addRow(['Pass Percentage', `${passRate}%`]);
  summarySheet.addRow(['Total Duration', `${(totalDuration / 1000).toFixed(2)} seconds`]);
  summarySheet.addRow(['Browser', 'Chrome (Headless)']);
  summarySheet.addRow(['OS', process.platform]);
  summarySheet.addRow(['Timestamp', new Date().toLocaleString()]);

  // SHEET 2: Test Details
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.views = [{ showGridLines: true }];

  detailsSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Test Name', key: 'name', width: 35 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Browser', key: 'browser', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Message', key: 'errorMessage', width: 45 },
    { header: 'Timestamp', key: 'timestamp', width: 25 }
  ];

  detailsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  results.forEach(r => {
    const row = detailsSheet.addRow({
      id: r.id,
      name: r.name,
      category: r.category || r.suite,
      browser: 'Chrome',
      status: r.status,
      duration: r.duration,
      errorMessage: r.errorMessage || 'N/A',
      timestamp: r.endTime || new Date().toISOString()
    });

    const statusCell = row.getCell('status');
    if (r.status === 'PASS') {
      statusCell.font = { bold: true, color: { argb: '15803D' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
    } else {
      statusCell.font = { bold: true, color: { argb: 'B91C1C' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
    }
  });

  // SHEET 3: Feature Coverage
  const coverageSheet = workbook.addWorksheet('Feature Coverage');
  coverageSheet.views = [{ showGridLines: true }];

  coverageSheet.columns = [
    { header: 'Feature', key: 'feature', width: 25 },
    { header: 'Test Cases', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 15 },
    { header: 'Failed', key: 'failed', width: 15 },
    { header: 'Coverage Status', key: 'status', width: 20 }
  ];

  coverageSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  coverageSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  const categories = [...new Set(results.map(r => r.category || r.suite))];
  categories.forEach(cat => {
    const catTests = results.filter(r => (r.category || r.suite) === cat);
    const catPassed = catTests.filter(r => r.status === 'PASS').length;
    const catFailed = catTests.filter(r => r.status === 'FAIL').length;
    const catStatus = catFailed === 0 ? 'COMPLETE (100%)' : 'PARTIAL';

    coverageSheet.addRow({
      feature: cat,
      total: catTests.length,
      passed: catPassed,
      failed: catFailed,
      status: catStatus
    });
  });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`Excel Report saved to: ${excelPath}`);

  // HTML Report Generation
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Selenium Web E2E Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    h1 { margin: 0 0 10px 0; color: #38bdf8; font-size: 24px; }
    .stats { display: flex; gap: 16px; margin-top: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 8px; flex: 1; text-align: center; }
    .card .val { font-size: 28px; font-weight: bold; margin-top: 6px; }
    .pass-val { color: #4ade80; }
    .fail-val { color: #f87171; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th { background: #334155; padding: 12px 16px; text-align: left; font-size: 13px; color: #94a3b8; }
    td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; display: inline-block; }
    .badge-pass { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid #4ade80; }
    .badge-fail { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid #f87171; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SmartStudy AI - Selenium Web E2E Test Report</h1>
    <p>Target Environment: Web Application (Vite / React) | Execution Time: ${new Date().toLocaleString()}</p>
    <div class="stats">
      <div class="card"><div>Total Tests</div><div class="val">${results.length}</div></div>
      <div class="card"><div>Passed</div><div class="val pass-val">${passed}</div></div>
      <div class="card"><div>Failed</div><div class="val fail-val">${failed}</div></div>
      <div class="card"><div>Pass Percentage</div><div class="val pass-val">${passRate}%</div></div>
      <div class="card"><div>Duration</div><div class="val">${(totalDuration / 1000).toFixed(2)}s</div></div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Category</th>
        <th>Test Case Name</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Details / Error</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.category || r.suite}</td>
          <td>${r.name}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.errorMessage || r.details || 'Verified successfully.'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  fs.writeFileSync(htmlPathAlt, htmlContent, 'utf8');
  console.log(`HTML Report saved to: ${htmlPath}`);

  // Populate standardized directory structure: Test Results/Web/
  const webBaseDir = path.resolve(__dirname, '../../Test Results/Web');
  const reportsLatestDir = path.join(webBaseDir, 'reports/latest');
  const webExcelDir = path.join(webBaseDir, 'excel');
  const webScreenshotsDir = path.join(webBaseDir, 'screenshots');
  const webLogsDir = path.join(webBaseDir, 'logs');
  const summaryDir = path.join(webBaseDir, 'Summary');

  [reportsLatestDir, webExcelDir, webScreenshotsDir, webLogsDir, summaryDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Copy HTML reports
  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'index.html'));
  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'selenium-report.html'));
  fs.copyFileSync(htmlPath, path.join(webBaseDir, 'selenium-report.html'));

  // Copy Excel reports
  fs.copyFileSync(excelPath, path.join(webExcelDir, 'selenium-report.xlsx'));
  fs.copyFileSync(excelPath, path.join(webBaseDir, 'selenium-report.xlsx'));

  // Summary markdown log
  const summaryMd = `# SmartStudy AI - Selenium Web E2E Test Summary

- **Total Test Cases:** ${results.length}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Pass Percentage:** ${passRate}%
- **Total Duration:** ${(totalDuration / 1000).toFixed(2)} seconds
- **Browser:** Chrome (Headless)
- **Timestamp:** ${new Date().toLocaleString()}

### Generated Deliverables
- **HTML Report:** \`Test Results/Web/reports/latest/index.html\`
- **Excel Report:** \`Test Results/Web/excel/selenium-report.xlsx\`
`;

  fs.writeFileSync(path.join(summaryDir, 'summary.md'), summaryMd, 'utf8');
  fs.writeFileSync(path.join(webLogsDir, 'summary.md'), summaryMd, 'utf8');
  fs.writeFileSync(path.join(logsDir, 'summary.md'), summaryMd, 'utf8');
}
