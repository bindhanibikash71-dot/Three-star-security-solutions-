/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XSquare, 
  Download, 
  Printer, 
  QrCode,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AttendanceRecord, SiteRecord, UserProfile } from '../types';

interface AttendanceViewProps {
  user: UserProfile | null;
  attendanceList: AttendanceRecord[];
  sites: SiteRecord[];
  onMarkCheckIn: (payload: { site_name: string; shift: 'Day Shift' | 'Night Shift'; remarks: string }) => Promise<void>;
  onVerifyAttendance: (id: number, verified: boolean) => Promise<void>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ 
  user, 
  attendanceList, 
  sites, 
  onMarkCheckIn, 
  onVerifyAttendance 
}) => {
  const [siteName, setSiteName] = useState('');
  const [shift, setShift] = useState<'Day Shift' | 'Night Shift'>('Day Shift');
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Setup QR dynamic metadata representing this security roster check
  const qrMockMetadata = JSON.stringify({
    appName: "Security Guard Pro",
    timestamp: new Date().toISOString(),
    employeeId: user?.employee_id,
    fullName: user?.full_name,
    gateToken: "SGPRO-PASS-" + Math.floor(10000 + Math.random() * 90000)
  });

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      alert('Please select an active station post (site)');
      return;
    }
    setSubmitting(true);
    try {
      await onMarkCheckIn({ site_name: siteName, shift, remarks });
      setRemarks('');
      alert('Roster presence logged successfully! Head Supervisor has been notified.');
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Employee Name', 'Employee ID', 'Primary Phone', 'Shift Date', 'Station Site', 'Roster Shift', 'Reporting Time', 'Manager Approval', 'Remarks'];
    const rows = filteredRecords.map(rec => [
      rec.id,
      rec.full_name || user?.full_name || '',
      rec.employee_id || user?.employee_id || '',
      rec.mobile_number || user?.mobile_number || '',
      rec.date,
      `"${rec.site_name.replace(/"/g, '""')}"`,
      rec.shift,
      rec.reporting_time,
      rec.verified ? 'VERIFIED' : 'PENDING',
      `"${rec.remarks.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Report_SGPRO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Representation
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = filteredRecords.map((rec, idx) => `
      <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
        <td style="padding: 10px;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: bold;">${rec.full_name || user?.full_name || 'N/A'}</td>
        <td style="padding: 10px; font-family: monospace;">${rec.employee_id || user?.employee_id || 'N/A'}</td>
        <td style="padding: 10px;">${rec.date}</td>
        <td style="padding: 10px;">${rec.site_name}</td>
        <td style="padding: 10px;">${rec.shift}</td>
        <td style="padding: 10px;">${rec.reporting_time}</td>
        <td style="padding: 10px;">
          <span style="padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 9px; ${
            rec.verified ? 'background-color: #d1fae5; color: #065f46;' : 'background-color: #fef3c7; color: #92400e;'
          }">
            ${rec.verified ? 'APPROVED' : 'PENDING'}
          </span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Roster Attendance Report - Security Guard Pro</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; font-family: sans-serif; letter-spacing: -1px; }
            .meta { font-size: 11px; text-align: right; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f3f4f6; text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
            .summary { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; margin-top: 40px; border-radius: 6px; display: flex; justify-content: space-around; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">THREE STAR SECURITY SOLUTIONS</div>
              <div style="font-size: 11px; color: #666;">COMMISSIONED SYSTEM FORCE PRESENCE LOGS</div>
            </div>
            <div class="meta">
              <strong>Export Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Command Operator:</strong> ${user?.full_name} (${user?.role})<br>
              <strong>Status:</strong> Verified Corporate Ledger
            </div>
          </div>
          
          <h2 style="font-size: 16px; margin-bottom: 15px;">Active Duty Attendance Registry</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Staff Officer</th>
                <th>Employee ID</th>
                <th>Duty Date</th>
                <th>Deployed Site</th>
                <th>Shift Roster</th>
                <th>Check-in Time</th>
                <th>Verification State</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div>Total Records: <strong>${filteredRecords.length}</strong></div>
            <div>Approved Presences: <strong>${filteredRecords.filter(r => r.verified === 1).length}</strong></div>
            <div>Awaiting Validation: <strong>${filteredRecords.filter(r => r.verified === 0).length}</strong></div>
          </div>
          
          <div style="margin-top: 60px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 15px;">
            Confidential. Security Force Management Systems. Generated by SG PRO.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredRecords = attendanceList.filter(rec => {
    const matchesSearch = 
      (rec.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.site_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesSite = selectedSiteFilter === 'All' || rec.site_name === selectedSiteFilter;
    
    return matchesSearch && matchesSite;
  });

  const checkInIsDisabled = () => {
    // Check if user already checked in today
    const today = new Date().toISOString().split('T')[0];
    return attendanceList.some(r => r.user_id === user?.id && r.date === today && r.shift === shift);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Attendance Logging panel */}
      <div class="lg:col-span-4 space-y-6">
        {/* Check-In Card Form */}
        <div class="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center space-x-2.5 mb-4 border-b border-slate-850 pb-3">
            <UserCheck class="w-5 h-5 text-blue-400" />
            <h2 class="font-bold text-sm tracking-tight text-white">Active Duty Check-In</h2>
          </div>
          
          <form onSubmit={handleCheckInSubmit} class="space-y-4">
            {/* Site Post Selection */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Station Post Site</label>
              <select
                id="checkin-site-select"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Assigned Site --</option>
                {sites.map(s => (
                  <option key={s.id} value={s.site_name}>{s.site_name}</option>
                ))}
              </select>
            </div>

            {/* Shift Choice */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Shift Duration</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  id="shift-day-button"
                  type="button"
                  onClick={() => setShift('Day Shift')}
                  class={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    shift === 'Day Shift' 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Day Shift (8 AM - 8 PM)
                </button>
                <button
                  id="shift-night-button"
                  type="button"
                  onClick={() => setShift('Night Shift')}
                  class={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    shift === 'Night Shift' 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Night Shift (8 PM - 8 AM)
                </button>
              </div>
            </div>

            {/* Special remarks */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Operational Remarks</label>
              <textarea
                id="checkin-remarks-input"
                rows={3}
                placeholder="Roster handovers, keys secure, kit inspections..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              id="submit-checkin-button"
              type="submit"
              disabled={submitting || checkInIsDisabled()}
              class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-500 hover:bg-blue-600 focus:outline-none disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-850 border border-blue-450 shadow-md shadow-blue-550/10 transition"
            >
              {submitting ? 'Registering Presence...' : checkInIsDisabled() ? 'Check-In Registered Today' : 'Mark Active Duty'}
            </button>
          </form>
        </div>

        {/* QR Code Gate Reader Box */}
        <div class="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm text-center">
          <div class="flex items-center justify-between mb-3 border-b border-slate-850 pb-2.5">
            <span class="font-bold text-xs text-white uppercase text-left tracking-wide">Duty Gate QR Pass</span>
            <QrCode class="w-4 h-4 text-blue-400" />
          </div>
          <p class="text-[10px] text-slate-400 text-left mb-4">
            Present this QR page representation to site sensors or supervising camera grids to automatic logging confirmation.
          </p>

          {!showQR ? (
            <button
              id="generate-qr-button"
              onClick={() => setShowQR(true)}
              class="w-full bg-slate-950 border border-slate-850 hover:bg-slate-850 text-blue-400 text-xs font-semibold py-2.5 rounded-lg transition"
            >
              Generate QR Gate Pass
            </button>
          ) : (
            <div class="bg-white p-4 rounded-xl inline-block border border-slate-200 relative">
              {/* Responsive SVG mock QR Code representation */}
              <svg class="w-32 h-32 text-slate-900" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                {/* corners */}
                <rect x="5" y="5" width="25" height="25" fill="black" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="12" y="12" width="11" height="11" fill="black" />

                <rect x="70" y="5" width="25" height="25" fill="black" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="77" y="12" width="11" height="11" fill="black" />

                <rect x="5" y="70" width="25" height="25" fill="black" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="12" y="77" width="11" height="11" fill="black" />

                {/* random dots representing code */}
                <rect x="40" y="10" width="8" height="8" fill="black" />
                <rect x="55" y="15" width="6" height="10" fill="black" />
                <rect x="42" y="35" width="10" height="5" fill="black" />
                <rect x="15" y="45" width="12" height="12" fill="black" />
                <rect x="35" y="60" width="25" height="15" fill="black" />
                <rect x="70" y="45" width="15" height="20" fill="black" />
                <rect x="80" y="80" width="10" height="10" fill="black" />
                <rect x="50" y="80" width="15" height="6" fill="black" />
                <rect x="45" y="45" width="8" height="8" fill="black" />
              </svg>
              <span class="text-[8px] font-mono text-slate-505 block mt-2 text-center uppercase tracking-wide">Token ID Valid</span>
              
              <button 
                id="hide-qr-button"
                onClick={() => setShowQR(false)} 
                class="absolute -top-2 -right-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Ledger Tables list */}
      <div id="attendance-ledger-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-3">
          <div>
            <h2 class="font-bold text-sm tracking-tight text-white">Presence Ledger</h2>
            <p class="text-[10px] text-slate-450 font-mono">Live checks registered system-wide</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              id="export-attendance-csv-button"
              onClick={handleExportCSV}
              class="flex items-center space-x-1.5 px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg text-slate-350 hover:text-white text-xs font-semibold transition"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              id="print-attendance-report-button"
              onClick={handlePrintReport}
              class="flex items-center space-x-1.5 px-3 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg text-slate-350 hover:text-white text-xs font-semibold transition"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Filter bars and searches */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-slate-950 border border-slate-850 flex items-center px-3 py-2 rounded-xl">
            <Search class="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder="Search guard name, ID or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              class="bg-transparent border-0 text-slate-200 text-xs w-full focus:outline-none placeholder-slate-600"
            />
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-500 shrink-0 uppercase font-bold text-[10px]">Site Filter:</span>
            <select
              id="attendance-site-filter"
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              class="w-full bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-xl p-2 focus:outline-none"
            >
              <option value="All">All Station Posts</option>
              {sites.map(s => (
                <option key={s.id} value={s.site_name}>{s.site_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance listings table */}
        <div class="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40 select-none">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                <th class="p-3">Staff Officer</th>
                <th class="p-3">Date</th>
                <th class="p-3">Site / Assignment</th>
                <th class="p-3">Shift</th>
                <th class="p-3 text-center">Status</th>
                {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && (
                  <th class="p-3 text-right">Approval</th>
                )}
              </tr>
            </thead>
            <tbody class="text-xs text-slate-300 divide-y divide-slate-850">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} class="p-6 text-center text-slate-500">
                    No matching attendance logs found in our SQLite ledger database.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} class="hover:bg-slate-900/30 transition duration-150">
                    <td class="p-3">
                      <div class="font-semibold text-slate-100">{rec.full_name || user?.full_name || 'My Record'}</div>
                      <div class="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                        {rec.employee_id || user?.employee_id || 'ID NA'} • {rec.mobile_number || user?.mobile_number || ''}
                      </div>
                    </td>
                    <td class="p-3 font-mono text-slate-400">{rec.date}</td>
                    <td class="p-3">
                      <span class="inline-flex items-center space-x-1 font-medium text-slate-200">
                        <MapPin class="w-3 h-3 text-blue-400" />
                        <span>{rec.site_name}</span>
                      </span>
                      {rec.remarks && (
                        <p class="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{rec.remarks}</p>
                      )}
                    </td>
                    <td class="p-3">
                      <div class="font-medium text-slate-300">{rec.shift}</div>
                      <div class="text-[10px] text-slate-550 font-mono">{rec.reporting_time} Check-In</div>
                    </td>
                    <td class="p-3 text-center">
                      <span class={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.verified 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {rec.verified ? (
                          <>
                            <ShieldCheck class="w-3 h-3" />
                            <span>APPROVED</span>
                          </>
                        ) : (
                          <span>PENDING</span>
                        )}
                      </span>
                      {rec.verified_by && (
                        <span class="block text-[9px] text-slate-500 mt-1">By: {rec.verified_by}</span>
                      )}
                    </td>
                    {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && (
                      <td class="p-3 text-right">
                        {rec.verified === 0 ? (
                          <button
                            id={`approve-attendance-${rec.id}`}
                            onClick={() => onVerifyAttendance(rec.id, true)}
                            class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition shadow-sm"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            id={`revoke-attendance-${rec.id}`}
                            onClick={() => onVerifyAttendance(rec.id, false)}
                            class="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-amber-400 rounded text-[10px] font-bold border border-slate-700 transition"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
