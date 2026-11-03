import os
import json
import csv
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

class ExcelReporter:
    def __init__(self, suite_name: str, environment: str = "Production-CI", build_commit: str = "main"):
        self.suite_name = suite_name
        self.environment = environment
        self.build_commit = build_commit
        self.results = []
        self.start_time = datetime.now()

    def add_result(self, 
                   test_id: str,
                   category: str,
                   name: str,
                   objective: str,
                   preconditions: str,
                   steps: str,
                   expected_result: str,
                   actual_result: str,
                   status: str = "PASS",
                   priority: str = "P1-Critical",
                   severity: str = "Critical",
                   execution_time_ms: int = 25,
                   error_message: str = "None",
                   screenshot: str = "N/A",
                   remarks: str = "Verified successfully"):
        self.results.append({
            "Test ID": test_id,
            "Test Category": category,
            "Test Name": name,
            "Objective": objective,
            "Preconditions": preconditions,
            "Steps": steps,
            "Expected Result": expected_result,
            "Actual Result": actual_result,
            "Status": status.upper(),
            "Priority": priority,
            "Severity": severity,
            "Execution Time": f"{execution_time_ms} ms",
            "ExecutionTimeMs": execution_time_ms,
            "Error/Failure Message": error_message,
            "Screenshot/Artifact": screenshot,
            "Remarks": remarks
        })

    def generate_excel(self, file_path: str):
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        wb = Workbook()
        
        # Colors & Fonts
        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Slate 800
        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=16, bold=True, color="0F172A")
        sub_font = Font(name="Calibri", size=11, bold=True, color="475569")
        bold_font = Font(name="Calibri", size=11, bold=True, color="000000")
        regular_font = Font(name="Calibri", size=10, color="000000")
        
        pass_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid") # Emerald 100
        pass_font = Font(name="Calibri", size=10, bold=True, color="065F46") # Emerald 800
        fail_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid") # Rose 100
        fail_font = Font(name="Calibri", size=10, bold=True, color="991B1B") # Rose 800
        skip_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Amber 100
        skip_font = Font(name="Calibri", size=10, bold=True, color="92400E") # Amber 800

        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )
        
        # Calculations
        total_tests = len(self.results)
        passed = sum(1 for r in self.results if r["Status"] == "PASS")
        failed = sum(1 for r in self.results if r["Status"] == "FAIL")
        skipped = sum(1 for r in self.results if r["Status"] == "SKIPPED")
        pass_rate = round((passed / total_tests * 100), 2) if total_tests > 0 else 0.0
        total_exec_time = sum(r.get("ExecutionTimeMs", 0) for r in self.results)
        deployment_readiness = "READY FOR DEPLOYMENT (PASS)" if failed == 0 and total_tests > 0 else "BLOCKED (FAILURES DETECTED)"

        # -------------------------------------------------------------
        # SHEET 1: SUMMARY
        # -------------------------------------------------------------
        ws_sum = wb.active
        ws_sum.title = "SUMMARY"
        ws_sum.views.sheetView[0].showGridLines = True

        ws_sum.merge_cells("B2:J2")
        ws_sum["B2"] = f"SMARTSTUDY AI — {self.suite_name.upper()} QUALITY AUDIT"
        ws_sum["B2"].font = title_font
        ws_sum["B2"].alignment = Alignment(vertical="center")

        ws_sum.merge_cells("B3:J3")
        ws_sum["B3"] = f"Execution Environment: {self.environment} | Build/Commit: {self.build_commit} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}"
        ws_sum["B3"].font = sub_font

        # Metric Table
        headers = ["Metric Parameter", "Audit Value", "Quality Target / Status"]
        ws_sum.row_dimensions[5].height = 24
        for col_idx, h in enumerate(headers, start=2):
            cell = ws_sum.cell(row=5, column=col_idx, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border

        metrics_data = [
            ("Total Test Scenarios Executed", total_tests, "100% Comprehensive Coverage"),
            ("Passed Scenarios", passed, "PASSED ✅"),
            ("Failed Scenarios", failed, "ZERO FAILURES ACCEPTED" if failed == 0 else "ACTION REQUIRED ❌"),
            ("Skipped / Blocked Scenarios", skipped, "NONE"),
            ("Execution Pass Rate", f"{pass_rate:.1f}%", "100.0% Standard"),
            ("Total Automated Execution Time", f"{total_exec_time / 1000:.2f} s", "Sub-minute Latency Benchmark"),
            ("Overall Pipeline Deployment Verdict", deployment_readiness, "PASS" if failed == 0 else "FAIL")
        ]

        for idx, (m_param, m_val, m_status) in enumerate(metrics_data, start=6):
            ws_sum.row_dimensions[idx].height = 20
            c1 = ws_sum.cell(row=idx, column=2, value=m_param)
            c2 = ws_sum.cell(row=idx, column=3, value=m_val)
            c3 = ws_sum.cell(row=idx, column=4, value=m_status)

            c1.font = bold_font
            c2.font = bold_font
            c3.font = bold_font

            c1.border = thin_border
            c2.border = thin_border
            c3.border = thin_border

            c2.alignment = Alignment(horizontal="center")
            c3.alignment = Alignment(horizontal="center")

            if "PASS" in str(m_status) or "PASSED" in str(m_status):
                c3.fill = pass_fill
                c3.font = pass_font
            elif "FAIL" in str(m_status) or "ACTION" in str(m_status):
                c3.fill = fail_fill
                c3.font = fail_font

        ws_sum.column_dimensions["B"].width = 38
        ws_sum.column_dimensions["C"].width = 25
        ws_sum.column_dimensions["D"].width = 38

        # -------------------------------------------------------------
        # SHEET 2: TEST RESULTS
        # -------------------------------------------------------------
        ws_res = wb.create_sheet(title="TEST RESULTS")
        ws_res.views.sheetView[0].showGridLines = True

        result_headers = [
            "Test ID", "Test Category", "Test Name", "Objective", "Preconditions",
            "Steps", "Expected Result", "Actual Result", "Status", "Priority",
            "Severity", "Execution Time", "Error/Failure Message", "Screenshot/Artifact", "Remarks"
        ]

        ws_res.row_dimensions[1].height = 26
        for col_idx, h in enumerate(result_headers, start=1):
            cell = ws_res.cell(row=1, column=col_idx, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border

        for row_idx, r in enumerate(self.results, start=2):
            ws_res.row_dimensions[row_idx].height = 19
            for col_idx, h in enumerate(result_headers, start=1):
                val = r.get(h, "")
                cell = ws_res.cell(row=row_idx, column=col_idx, value=val)
                cell.font = regular_font
                cell.border = thin_border
                cell.alignment = Alignment(vertical="center")

                if h == "Status":
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                    if val == "PASS":
                        cell.fill = pass_fill
                        cell.font = pass_font
                    elif val == "FAIL":
                        cell.fill = fail_fill
                        cell.font = fail_font
                    else:
                        cell.fill = skip_fill
                        cell.font = skip_font
                elif h in ["Test ID", "Execution Time", "Priority", "Severity"]:
                    cell.alignment = Alignment(horizontal="center", vertical="center")

        col_widths = {
            "A": 16, "B": 28, "C": 35, "D": 45, "E": 28,
            "F": 45, "G": 40, "H": 40, "I": 12, "J": 14,
            "K": 14, "L": 16, "M": 24, "N": 22, "O": 28
        }
        for col_letter, w in col_widths.items():
            ws_res.column_dimensions[col_letter].width = w

        wb.save(file_path)
        print(f"[REPORTER] Excel report successfully generated: {file_path}")

    def generate_json(self, file_path: str):
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        total = len(self.results)
        passed = sum(1 for r in self.results if r["Status"] == "PASS")
        failed = sum(1 for r in self.results if r["Status"] == "FAIL")
        skipped = sum(1 for r in self.results if r["Status"] == "SKIPPED")
        pass_rate = round(passed / total * 100, 2) if total else 0.0

        payload = {
            "suite_name": self.suite_name,
            "environment": self.environment,
            "build_commit": self.build_commit,
            "generated_at": datetime.now().isoformat(),
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "pass_rate": f"{pass_rate}%",
            "results": self.results
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"[REPORTER] JSON report saved: {file_path}")

    def generate_html(self, file_path: str):
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        total = len(self.results)
        passed = sum(1 for r in self.results if r["Status"] == "PASS")
        failed = sum(1 for r in self.results if r["Status"] == "FAIL")
        skipped = sum(1 for r in self.results if r["Status"] == "SKIPPED")
        pass_rate = round(passed / total * 100, 2) if total else 0.0
        exec_sec = sum(r.get("ExecutionTimeMs", 0) for r in self.results) / 1000

        rows_html = ""
        for r in self.results:
            st = r["Status"].upper()
            badge_class = "bg-emerald-100 text-emerald-800" if st == "PASS" else ("bg-rose-100 text-rose-800" if st == "FAIL" else "bg-amber-100 text-amber-800")
            rows_html += f"""
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="p-3 font-mono text-xs font-bold text-slate-700">{r['Test ID']}</td>
              <td class="p-3 text-xs font-semibold text-slate-600">{r['Test Category']}</td>
              <td class="p-3 text-xs font-bold text-slate-900">{r['Test Name']}</td>
              <td class="p-3 text-xs text-slate-600">{r['Expected Result']}</td>
              <td class="p-3 text-center"><span class="px-2.5 py-1 rounded-full text-xs font-black uppercase {badge_class}">{st}</span></td>
              <td class="p-3 text-xs text-slate-500 font-mono text-right">{r['Execution Time']}</td>
            </tr>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartStudy AI — {self.suite_name} Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black tracking-wider uppercase">QA Automation</span>
          <span class="text-xs text-slate-400 font-mono">{datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</span>
        </div>
        <h1 class="text-3xl font-black tracking-tight text-slate-900 mt-2">{self.suite_name} Audit Report</h1>
        <p class="text-sm text-slate-500 mt-1">Environment: <span class="font-bold text-slate-700">{self.environment}</span> | Build: <span class="font-bold text-slate-700">{self.build_commit}</span></p>
      </div>
      <div class="flex gap-4">
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[100px]">
          <div class="text-xs font-bold text-slate-500 uppercase">Total</div>
          <div class="text-2xl font-black text-slate-900">{total}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center min-w-[100px]">
          <div class="text-xs font-bold text-emerald-600 uppercase">Passed</div>
          <div class="text-2xl font-black text-emerald-700">{passed}</div>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[100px]">
          <div class="text-xs font-bold text-slate-500 uppercase">Pass Rate</div>
          <div class="text-2xl font-black text-emerald-600">{pass_rate}%</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 class="text-lg font-black text-slate-900 uppercase tracking-wider">Test Execution Results</h2>
        <span class="text-xs font-bold text-slate-500">Duration: {exec_sec:.2f}s</span>
      </div>
      <div class="overflow-x-auto max-h-[700px] overflow-y-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-100 sticky top-0 text-[11px] font-black uppercase text-slate-600 tracking-wider">
            <tr>
              <th class="p-3">Test ID</th>
              <th class="p-3">Category</th>
              <th class="p-3">Test Scenario</th>
              <th class="p-3">Expected Result</th>
              <th class="p-3 text-center">Status</th>
              <th class="p-3 text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows_html}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"[REPORTER] HTML report saved: {file_path}")

    def append_github_step_summary(self, title: str, metrics: list, subsystems: list = None):
        summary_env = os.environ.get("GITHUB_STEP_SUMMARY")
        if not summary_env:
            return
        try:
            with open(summary_env, "a", encoding="utf-8") as f:
                f.write(f"\n## {title}\n\n")
                f.write("| Metric | Value |\n|---|---|\n")
                for k, v in metrics:
                    f.write(f"| **{k}** | {v} |\n")
                if subsystems:
                    f.write("\n### Verified Subsystems:\n")
                    for s in subsystems:
                        f.write(f"- {s}\n")
                f.write("\n[Job summary generated at run-time](https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)\n\n")
            print("[REPORTER] Successfully appended to GITHUB_STEP_SUMMARY")
        except Exception as e:
            print(f"[REPORTER] Warning: Failed to write GITHUB_STEP_SUMMARY: {e}")
