/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BadgeIndianRupee, 
  Calculator, 
  FileCheck, 
  Download, 
  Printer, 
  Clock, 
  Percent,
  CalendarCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface SalaryViewProps {
  user: UserProfile | null;
  attendanceCount: number;
}

export const SalaryView: React.FC<SalaryViewProps> = ({ user, attendanceCount }) => {
  // Configurable base calculations
  const [baseInputSalary, setBaseInputSalary] = useState(24000);
  const [scheduledDutyDays, setScheduledDutyDays] = useState(26);
  const [presentDays, setPresentDays] = useState(attendanceCount > 0 ? attendanceCount : 22);
  const [overtimeHours, setOvertimeHours] = useState(15);
  const [overtimeRate, setOvertimeRate] = useState(180);
  
  // Update present days if attendance count changes
  useEffect(() => {
    if (attendanceCount > 0) {
      setPresentDays(attendanceCount);
    }
  }, [attendanceCount]);

  // Derived variables
  const computedBaseEarned = Math.round((baseInputSalary / scheduledDutyDays) * Math.min(presentDays, scheduledDutyDays));
  const computedOvertimeEarned = Math.round(overtimeHours * overtimeRate);
  
  // Allowances & Deductions
  const travelAllowance = 1500;
  const providentFundDeduction = Math.round(computedBaseEarned * 0.12); // 12% PF contribution
  const professionalTax = 200;

  const grossEarnings = computedBaseEarned + computedOvertimeEarned + travelAllowance;
  const totalDeductions = providentFundDeduction + professionalTax;
  const netPayable = grossEarnings - totalDeductions;

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip Statement - SG PRO</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; font-size: 13px; line-height: 1.5; }
            .badge-banner { display: flex; justify-content: space-between; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 30px; }
            .payslip-title { font-size: 20px; font-weight: bold; letter-spacing: -0.5px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
            .table-block { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .table-block th, .table-block td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .table-block th { background-color: #f8fafc; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            .right-align { text-align: right; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="badge-banner">
            <div>
              <div class="payslip-title">SECURITY GUARD PRO</div>
              <div style="font-size: 10px; color: #666; text-transform: uppercase;">MEMBER OF COMMISSIONED OPERATIONS FORCE</div>
            </div>
            <div>
              <div style="text-align: right; font-weight: bold; font-size: 14px;">STAFF PAYSLIP</div>
              <div style="text-align: right; font-size: 11px; color: #444;">Month: June 2026</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <strong>Officer Identity:</strong> ${user?.full_name}<br>
              <strong>Employee ID:</strong> ${user?.employee_id || 'N/A'}<br>
              <strong>Designation:</strong> ${user?.designation || 'Security Officer'}
            </div>
            <div>
              <strong>Regulated Station Post:</strong> Head Office Deployments<br>
              <strong>Present days / Duty days:</strong> ${presentDays} / ${scheduledDutyDays} days<br>
              <strong>Overtime Hours Logged:</strong> ${overtimeHours} Hours
            </div>
          </div>

          <table class="table-block">
            <thead>
              <tr>
                <th>Earnings (Incentives & Pay)</th>
                <th class="right-align">Amount (INR)</th>
                <th>Deductions</th>
                <th class="right-align">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Base Earned Salary (duty ratio)</td>
                <td class="right-align">${computedBaseEarned.toLocaleString('en-IN')}</td>
                <td>Provident Fund (12%)</td>
                <td class="right-align">${providentFundDeduction.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Roster Overtime Allowance</td>
                <td class="right-align">${computedOvertimeEarned.toLocaleString('en-IN')}</td>
                <td>Professional Tax</td>
                <td class="right-align">${professionalTax.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Transit Travel Allowance (TA)</td>
                <td class="right-align">${travelAllowance.toLocaleString('en-IN')}</td>
                <td>-</td>
                <td class="right-align">0</td>
              </tr>
              <tr class="bold">
                <td>Gross Monthly Earnings</td>
                <td class="right-align">${grossEarnings.toLocaleString('en-IN')}</td>
                <td>Total Monthly Deductions</td>
                <td class="right-align">${totalDeductions.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border: 1px solid #cbd5e1;">
            <span>NET DISBURSED PAYABLE AMOUNT:</span>
            <span>INR ${netPayable.toLocaleString('en-IN')}/-</span>
          </div>

          <div style="margin-top: 60px; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 12px; text-align: center;">
            This dispatch serves as an official proof of operations salary disbursement. Confidential. Powered by SG Pro SQLite.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Interactive Salary calculator inputs panel */}
      <div class="lg:col-span-5 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3">
          <Calculator class="w-5 h-5 text-blue-450" />
          <h2 class="font-bold text-sm text-white tracking-tight">Active Roster Salary Calculator</h2>
        </div>

        <div class="space-y-4 text-xs">
          {/* Base monthly pay */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Regulated Base Monthly Salary (INR)</label>
            <div class="flex rounded-xl bg-slate-950 border border-slate-850">
              <span class="p-3 text-slate-600 bg-slate-1000 rounded-l-xl font-bold border-r border-slate-850">₹</span>
              <input
                id="salary-base-input"
                type="number"
                value={baseInputSalary}
                onChange={(e) => setBaseInputSalary(Number(e.target.value))}
                class="w-full bg-transparent p-3 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Present duty days / scheduled rosters */}
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Scheduled Duty Days</label>
              <input
                id="salary-duty-days-input"
                type="number"
                value={scheduledDutyDays}
                onChange={(e) => setScheduledDutyDays(Number(e.target.value))}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Present Logged Days</label>
              <input
                id="salary-present-days-input"
                type="number"
                value={presentDays}
                onChange={(e) => setPresentDays(Number(e.target.value))}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
              <span class="text-[9px] text-blue-400 font-mono mt-1 block">✓ Synced {attendanceCount} from DB</span>
            </div>
          </div>

          {/* Overtime settings */}
          <div class="grid grid-cols-2 gap-3 border-t border-slate-850 pt-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Overtime Hours Logged</label>
              <input
                id="salary-ot-hours-input"
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Overtime Rate (INR/hr)</label>
              <input
                id="salary-ot-rate-input"
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(Number(e.target.value))}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div class="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
          <span class="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Provident Fund Calculation Parameter</span>
          <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Standard 12% employee provident contribution deducted directly for retirement indices. Travel allowances configured as non-taxable flat rates (Transit flat: INR 1,500).
          </p>
        </div>
      </div>

      {/* Slip Generator and Beautiful Statement Document Preview */}
      <div id="salary-statement-block" class="lg:col-span-7 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h2 class="font-bold text-sm tracking-tight text-white">Disbursement Slip Statement</h2>
            <p class="text-[10px] text-slate-500 font-mono">Month: June 2026 Audit Index</p>
          </div>
          <button
            id="print-payslip-statement-button"
            onClick={handlePrintSlip}
            class="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg text-slate-300 hover:text-white text-xs font-bold transition duration-150"
          >
            <Printer class="w-3.5 h-3.5 text-blue-400" />
            <span>Print Payslip Sheet</span>
          </button>
        </div>

        {/* Outer document visual frame */}
        <div class="p-6 bg-slate-950 border border-slate-850 rounded-xl font-sans relative overflow-hidden text-slate-300 space-y-4 shadow-inner">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

          {/* Letterhead header */}
          <div class="flex justify-between items-start border-b border-slate-850 pb-3 gap-3">
            <div>
              <span class="text-xs font-bold tracking-tight text-white block">SECURITY GUARD PRO</span>
              <span class="text-[9px] text-blue-450 uppercase font-mono tracking-widest block font-bold">Roster Dispatch Invoice</span>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-slate-400">Month Summary</span>
              <span class="text-[10px] font-mono text-slate-500 block">Report Ref: #PAY-J26</span>
            </div>
          </div>

          {/* Employee description */}
          <div class="grid grid-cols-2 gap-4 text-[11px] border-b border-slate-850 pb-3">
            <div class="space-y-1">
              <div><span class="text-slate-550">Officer:</span> <strong class="text-slate-300">{user?.full_name}</strong></div>
              <div><span class="text-slate-550">Emp ID:</span> <strong class="text-slate-300 text-xs font-mono">{user?.employee_id || 'N/A'}</strong></div>
              <div><span class="text-slate-550">Designation:</span> <strong class="text-slate-300 font-medium">{user?.designation || 'Active Security Force'}</strong></div>
            </div>
            <div class="space-y-1">
              <div><span class="text-slate-550">Station Post:</span> <span class="text-slate-300 font-mono text-xs">Global Tech Main Block</span></div>
              <div><span class="text-slate-550">Tour Ratio:</span> <span class="text-slate-300 font-semibold font-mono">{presentDays} / {scheduledDutyDays} days</span></div>
              <div><span class="text-slate-550">Transit Index:</span> <span class="text-slate-300 font-mono">TA Approved</span></div>
            </div>
          </div>

          {/* Ledger calculations table representing Payslip */}
          <div class="text-[11px] space-y-2.5">
            {/* Headers */}
            <div class="flex justify-between font-bold border-b border-slate-850 pb-1.5 uppercase text-[9px] tracking-wide text-slate-450">
              <span>Roster Ledger Items</span>
              <span class="font-mono">Amount (₹)</span>
            </div>

            {/* Base earned */}
            <div class="flex justify-between hover:bg-slate-900/40 p-1 rounded">
              <span class="text-slate-400">Base Earned Salary (Att ratio)</span>
              <span class="font-mono text-slate-200">₹ {computedBaseEarned.toLocaleString('en-IN')}</span>
            </div>

            {/* Overtime */}
            <div class="flex justify-between hover:bg-slate-900/40 p-1 rounded">
              <span class="text-slate-400">Overtime Premium Allowances ({overtimeHours} hrs)</span>
              <span class="font-mono text-slate-200">+ ₹ {computedOvertimeEarned.toLocaleString('en-IN')}</span>
            </div>

            {/* Flat allowances */}
            <div class="flex justify-between hover:bg-slate-900/40 p-1 rounded">
              <span class="text-slate-400">Transit Flat Allowance (TA)</span>
              <span class="font-mono text-slate-200">+ ₹ {travelAllowance.toLocaleString('en-IN')}</span>
            </div>

            {/* PF Contributions */}
            <div class="flex justify-between hover:bg-slate-900/40 p-1 rounded">
              <span class="text-slate-400">Provident retirement Fund Deduction (12%)</span>
              <span class="font-mono text-rose-400">- ₹ {providentFundDeduction.toLocaleString('en-IN')}</span>
            </div>

            {/* Taxes */}
            <div class="flex justify-between hover:bg-slate-900/40 p-1 rounded border-b border-slate-850 pb-2">
              <span class="text-slate-400">Professional State Tax</span>
              <span class="font-mono text-rose-400">- ₹ {professionalTax.toLocaleString('en-IN')}</span>
            </div>

            {/* Net payload summary banner */}
            <div class="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-lg mt-2">
              <span class="font-bold text-xs text-slate-300">NET DISBURSED DISPOSAL:</span>
              <span class="font-bold text-base text-emerald-400 font-mono">INR {netPayable.toLocaleString('en-IN')}/-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
