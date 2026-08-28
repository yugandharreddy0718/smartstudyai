import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/test.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateAppiumReports(options) {
  const {
    executionMode = 'VERIFICATION_MODE',
    deviceId = config.deviceName,
    deviceAvailable = false,
    driverConnected = false,
    results = [],
    totalDuration = 0
  } = options;

  const reportsDir = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const excelPath = path.join(reportsDir, 'appium-report.xlsx');
  const htmlPath = path.join(reportsDir, 'appium-report.html');

  const workbook = new ExcelJS.Workbook();

  const isLive = executionMode === 'REAL_DEVICE' || executionMode === 'EMULATOR';
  const executed = isLive ? results.filter(r => r.status === 'PASS' || r.status === 'FAIL').length : 0;
  const passed = isLive ? results.filter(r => r.status === 'PASS').length : 0;
  const failed = isLive ? results.filter(r => r.status === 'FAIL').length : 0;
  const notExecuted = isLive ? results.filter(r => r.status === 'NOT_EXECUTED').length : results.length;
  const passRate = executed > 0 ? ((passed / executed) * 100).toFixed(1) + '%' : 'N/A (NOT EXECUTED)';

  // ==========================================
  // SHEET 1: SUMMARY
  // ==========================================
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.views = [{ showGridLines: true }];

  summarySheet.mergeCells('A1:F2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'SMARTSTUDY AI - ANDROID E2E APPIUM COVERAGE REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isLive ? '0F172A' : '475569' } };

  summarySheet.addRow([]);
  summarySheet.addRow(['Execution Property', 'Value']);
  summarySheet.getRow(4).font = { bold: true };
  summarySheet.addRow(['Execution Mode', executionMode]);
  summarySheet.addRow(['Target Device ID', deviceId]);
  summarySheet.addRow(['Physical Device Availability', deviceAvailable ? 'AVAILABLE' : 'UNAVAILABLE']);
  summarySheet.addRow(['Appium Driver Connected', driverConnected ? 'YES' : 'NO']);
  summarySheet.addRow(['App Package', config.appPackage]);
  summarySheet.addRow(['Automation Engine', config.automationName]);
  summarySheet.addRow(['Total Scenarios', results.length]);
  summarySheet.addRow(['Actually Executed', executed]);
  summarySheet.addRow(['Passed Test Cases', passed]);
  summarySheet.addRow(['Failed Test Cases', failed]);
  summarySheet.addRow(['Not Executed Test Cases', notExecuted]);
  summarySheet.addRow(['Pass Percentage', passRate]);
  summarySheet.addRow(['Total Execution Time', `${(totalDuration / 1000).toFixed(2)} seconds`]);
  summarySheet.addRow(['Report Generated At', new Date().toLocaleString()]);

  for (let i = 4; i <= 17; i++) {
    const row = summarySheet.getRow(i);
    row.getCell(1).font = { bold: true, color: { argb: '334155' } };
  }

  // ==========================================
  // SHEET 2: TEST DETAILS
  // ==========================================
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.views = [{ showGridLines: true }];

  detailsSheet.columns = [
    { header: 'Test ID', key: 'id', width: 12 },
    { header: 'Suite / Feature', key: 'suite', width: 24 },
    { header: 'Test Case Scenario', key: 'name', width: 45 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 25 },
    { header: 'End Time', key: 'endTime', width: 25 },
    { header: 'Details / Error', key: 'details', width: 50 },
    { header: 'Screenshot Path', key: 'screenshot', width: 35 }
  ];

  detailsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  results.forEach((r) => {
    const row = detailsSheet.addRow({
      id: r.id,
      suite: r.suite,
      name: r.name,
      status: r.status,
      duration: r.duration,
      startTime: r.startTime,
      endTime: r.endTime,
      details: r.errorMessage || r.details || (r.status === 'NOT_EXECUTED' ? 'Real device unavailable - Test skipped' : 'PASS'),
      screenshot: r.screenshotPath || 'N/A'
    });

    const statusCell = row.getCell('status');
    if (r.status === 'PASS') {
      statusCell.font = { bold: true, color: { argb: '15803D' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
    } else if (r.status === 'FAIL') {
      statusCell.font = { bold: true, color: { argb: 'B91C1C' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
    } else {
      statusCell.font = { bold: true, color: { argb: 'D97706' } };
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
    }
  });

  // ==========================================
  // SHEET 3: FEATURE COVERAGE
  // ==========================================
  const coverageSheet = workbook.addWorksheet('Feature Coverage');
  coverageSheet.views = [{ showGridLines: true }];

  coverageSheet.columns = [
    { header: 'Feature Category', key: 'feature', width: 30 },
    { header: 'Total Scenarios', key: 'total', width: 18 },
    { header: 'Passed', key: 'passed', width: 14 },
    { header: 'Failed', key: 'failed', width: 14 },
    { header: 'Not Executed', key: 'notExecuted', width: 16 },
    { header: 'Coverage Status', key: 'coverage', width: 35 }
  ];

  coverageSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  coverageSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

  const suitesMap = {};
  results.forEach(r => {
    const s = r.suite || 'General';
    if (!suitesMap[s]) suitesMap[s] = { total: 0, passed: 0, failed: 0, notExec: 0 };
    suitesMap[s].total++;
    if (r.status === 'PASS') suitesMap[s].passed++;
    else if (r.status === 'FAIL') suitesMap[s].failed++;
    else suitesMap[s].notExec++;
  });

  Object.keys(suitesMap).forEach(s => {
    const item = suitesMap[s];
    const covStatus = isLive
      ? `${((item.passed / item.total) * 100).toFixed(0)}% (PASS)`
      : `0% (VERIFICATION MODE — DEVICE UNAVAILABLE)`;

    coverageSheet.addRow({
      feature: s,
      total: item.total,
      passed: item.passed,
      failed: item.failed,
      notExecuted: item.notExec,
      coverage: covStatus
    });
  });

  // ==========================================
  // SHEET 4: DEVICE INFORMATION
  // ==========================================
  const deviceSheet = workbook.addWorksheet('Device Information');
  deviceSheet.views = [{ showGridLines: true }];

  deviceSheet.columns = [
    { header: 'Device Attribute', key: 'attr', width: 32 },
    { header: 'Configured Value', key: 'val', width: 48 }
  ];

  deviceSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  deviceSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

  deviceSheet.addRow({ attr: 'Target Device Identifier', val: deviceId });
  deviceSheet.addRow({ attr: 'Execution Mode', val: executionMode });
  deviceSheet.addRow({ attr: 'Physical Device ADB Status', val: deviceAvailable ? 'ONLINE (device)' : 'OFFLINE (disconnected)' });
  deviceSheet.addRow({ attr: 'Appium Driver Connection', val: driverConnected ? 'CONNECTED' : 'NOT CONNECTED' });
  deviceSheet.addRow({ attr: 'Android Version / API Level', val: 'Android 16 (API 36)' });
  deviceSheet.addRow({ attr: 'App Package Name', val: config.appPackage });
  deviceSheet.addRow({ attr: 'App Launch Activity', val: config.appActivity });
  deviceSheet.addRow({ attr: 'Automation Engine', val: config.automationName });
  deviceSheet.addRow({ attr: 'Appium Server Endpoint', val: `${config.host}:${config.port}` });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`Excel Report saved to: ${excelPath}`);

  // HTML Report Generation
  const bannerText = isLive
    ? `REAL DEVICE EXECUTION — ${deviceId}`
    : `VERIFICATION MODE — REAL DEVICE TESTS NOT EXECUTED`;
  const bannerClass = isLive ? 'banner-live' : 'banner-verify';

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI - Appium Mobile E2E Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    .banner { padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 20px; text-align: center; letter-spacing: 0.5px; }
    .banner-live { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; }
    .banner-verify { background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; color: #facc15; }
    h1 { margin: 0 0 10px 0; color: #38bdf8; font-size: 24px; }
    .stats { display: flex; gap: 16px; margin-top: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 8px; flex: 1; text-align: center; }
    .card .val { font-size: 28px; font-weight: bold; margin-top: 6px; }
    .pass-val { color: #4ade80; }
    .fail-val { color: #f87171; }
    .warn-val { color: #facc15; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th { background: #334155; padding: 12px 16px; text-align: left; font-size: 13px; color: #94a3b8; }
    td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; display: inline-block; }
    .badge-pass { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid #4ade80; }
    .badge-fail { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid #f87171; }
    .badge-not_executed { background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid #facc15; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SmartStudy AI - Android Appium E2E Test Report</h1>
    <div class="banner ${bannerClass}">${bannerText}</div>
    <p>Target Device: ${deviceId} | Execution Mode: <strong>${executionMode}</strong> | Time: ${new Date().toLocaleString()}</p>
    <div class="stats">
      <div class="card"><div>Total Scenarios</div><div class="val">${results.length}</div></div>
      <div class="card"><div>Executed</div><div class="val">${executed}</div></div>
      <div class="card"><div>Passed</div><div class="val pass-val">${passed}</div></div>
      <div class="card"><div>Failed</div><div class="val fail-val">${failed}</div></div>
      <div class="card"><div>Not Executed</div><div class="val warn-val">${notExecuted}</div></div>
      <div class="card"><div>Pass Percentage</div><div class="val pass-val">${passRate}</div></div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Suite</th>
        <th>Test Case Scenario</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.suite}</td>
          <td>${r.name}</td>
          <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
          <td>${r.duration}ms</td>
          <td>${r.errorMessage || r.details || (r.status === 'NOT_EXECUTED' ? 'Real device unavailable - Test skipped' : 'PASS')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`HTML Report saved to: ${htmlPath}`);

  // Mirror to Test Results/Mobile/
  const mobileBaseDir = path.resolve(__dirname, '../../Test Results/Mobile');
  const reportsLatestDir = path.join(mobileBaseDir, 'reports/latest');
  const excelDir = path.join(mobileBaseDir, 'excel');

  fs.mkdirSync(reportsLatestDir, { recursive: true });
  fs.mkdirSync(excelDir, { recursive: true });

  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'appium-report.html'));
  fs.copyFileSync(htmlPath, path.join(reportsLatestDir, 'index.html'));
  fs.copyFileSync(htmlPath, path.join(mobileBaseDir, 'appium-report.html'));

  fs.copyFileSync(excelPath, path.join(excelDir, 'appium-report.xlsx'));
  fs.copyFileSync(excelPath, path.join(mobileBaseDir, 'appium-report.xlsx'));
}
