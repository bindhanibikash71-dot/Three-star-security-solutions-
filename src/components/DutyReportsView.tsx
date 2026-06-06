/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Printer, 
  PlusSquare,
  FileText
} from 'lucide-react';
import { DutyReport, SiteRecord, UserProfile } from '../types';

interface DutyReportsViewProps {
  user: UserProfile | null;
  reportsList: DutyReport[];
  sites: SiteRecord[];
  onAddReport: (payload: {
    site_name: string;
    shift_time: string;
    duty_status: string;
    incident_details: string;
    remarks: string;
  }) => Promise<void>;
  onDeleteReport?: (id: number) => Promise<void>;
}

export const DutyReportsView: React.FC<DutyReportsViewProps> = ({
  user,
  reportsList,
  sites,
  onAddReport,
  onDeleteReport
}) => {
  const [siteName, setSiteName] = useState('');
  const [shiftTime, setShiftTime] = useState('8:00 AM - 8:00 PM');
  const [dutyStatus, setDutyStatus] = useState('All Clear / Normal operations');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      alert('Active Deployment site post is required');
      return;
    }
    if (dutyStatus === 'Incident Occurred' && !incidentDetails) {
      alert('Please specify the Incident details that occurred during this shift');
      return;
    }

    setSubmitting(true);
    try {
      await onAddReport({
        site_name: siteName,
        shift_time: shiftTime,
        duty_status: dutyStatus,
        incident_details: incidentDetails,
        remarks: remarks
      });
      setRemarks('');
      setIncidentDetails('');
      setDutyStatus('All Clear / Normal operations');
      alert('Roster duty shift document filed successfully! System database updated.');
    } catch (err: any) {
      alert(err.message || 'Verification failure filing report');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintIndividualReport = (rep: DutyReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Roster Shift Detail Certificate - SG PRO</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header-panel { border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 30px; }
            .badge-title { font-size: 20px; font-weight: bold; letter-spacing: -0.5px; }
            .meta-block { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f9fafb; padding: 15px; border-radius: 6px; border: 1px dashed #ccc; }
            .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
            .val { font-size: 14px; font-weight: 550; color: #111; margin-bottom: 10px; }
            .content-block { border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; background-color: #fff; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header-panel">
            <span class="badge-title">SECURITY GUARD PRO</span>
            <div style="font-size: 11px; color: #666; text-transform: uppercase;">Roster Shift Patrol Incident Certificate</div>
          </div>
          
          <h2 style="font-size: 16px; margin-bottom: 20px;">DEPLOYMENT LOG: #${rep.id}</h2>

          <div class="meta-block">
            <div>
              <div class="label">Staff Officer Name</div>
              <div class="val">${rep.guard_name || user?.full_name}</div>

              <div class="label">Duty Station Post Name</div>
              <div class="val">${rep.site_name}</div>
            </div>
            <div>
              <div class="label">Roster Shift Schedule</div>
              <div class="val">${rep.shift_time}</div>

              <div class="label">Filing Timestamp</div>
              <div class="val">${rep.date_time}</div>
            </div>
          </div>

          <div class="content-block">
            <div class="label">Patrol Shift Operational Status</div>
            <div class="val" style="color: ${rep.duty_status.includes('Incident') ? '#b91c1c' : '#047857'}">${rep.duty_status}</div>

            <div style="margin-top: 15px;">
              <div class="label" style="font-weight: bold;">Specific Incident Details</div>
              <div class="val" style="font-family: inherit; font-size: 13px; color: #333; background: #fffdfa; padding: 10px; border: 1px solid #f5efe6; border-radius: 4px; border-left: 3px solid #f59e0b;">
                ${rep.incident_details || 'No security incidences occurred during this tour of duty.'}
              </div>
            </div>

            <div style="margin-top: 15px;">
              <div class="label" style="font-weight: bold;">Staff Handover Remarks</div>
              <div class="val" style="font-size: 13px; color: #333;">
                ${rep.remarks || 'All assets and keys transferred in normal operational levels.'}
              </div>
            </div>
          </div>

          <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 15px; font-size: 11px; color:#777; text-align: center;">
            This is an autogenerated secure database roster log on SQLite. SG PRO Security, 2026.
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
      {/* Create New Duty Report Card form */}
      <div id="create-duty-report-card" class="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3 mb-4">
          <PlusSquare class="w-5 h-5 text-blue-400" />
          <h2 class="font-bold text-sm text-white tracking-tight">File Shift Patrol Log</h2>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          {/* Site Post */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Duty Station Post</label>
            <select
              id="duty-report-site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505"
            >
              <option value="">-- Choose Assigned Post --</option>
              {sites.map(s => (
                <option key={s.id} value={s.site_name}>{s.site_name}</option>
              ))}
            </select>
          </div>

          {/* Shift Hours */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Shift Tour Schedule</label>
            <input
              id="duty-report-shift-time"
              type="text"
              placeholder="e.g. 08:00 AM - 08:00 PM (12hr roster)"
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-700"
            />
          </div>

          {/* Duty Status */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Active Status Index</label>
            <select
              id="duty-report-status"
              value={dutyStatus}
              onChange={(e) => setDutyStatus(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505"
            >
              <option value="All Clear / Normal operations">All Clear / Normal operations</option>
              <option value="Shift Patrol Completed - Routine reports">Shift Patrol Completed - Routine reports</option>
              <option value="Incident Occurred">⚠️ Emergency Incident Occurred!</option>
              <option value="Facility Handovers - Key Logs Cleared">Facility Handovers - Key Logs Cleared</option>
            </select>
          </div>

          {/* Conditional Incident Details */}
          {dutyStatus === 'Incident Occurred' && (
            <div id="incident-details-input-container" class="p-3 bg-red-950/20 border border-red-900/30 rounded-xl space-y-2">
              <label class="block text-xs font-semibold text-red-400 uppercase">Emergency Incident Details</label>
              <textarea
                id="duty-report-incident"
                rows={3}
                placeholder="Specific intrusions, hazard alarms, assets lockouts, system faults..."
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                required={dutyStatus === 'Incident Occurred'}
                class="w-full bg-slate-950 border border-red-900/40 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-red-500 placeholder-slate-700 resize-none"
              />
            </div>
          )}

          {/* Other remarks */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Tour Handover Remarks</label>
            <textarea
              id="duty-report-remarks"
              rows={3}
              placeholder="Rounds done, keys handed over, locks secure, emergency contacts verified..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-700 resize-none"
            />
          </div>

          <button
            id="submit-duty-report-button"
            type="submit"
            disabled={submitting}
            class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none border border-blue-500/20 transition"
          >
            {submitting ? 'Registering Document...' : 'Submit Tour Handover Roster'}
          </button>
        </form>
      </div>

      {/* Duty Reports List Ledger */}
      <div id="duty-reports-ledger-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-sm tracking-tight text-white">Shift Tour Reports & Logs</h2>
          <p class="text-[10px] text-slate-500 font-mono">SQLite Handover Database logs for active sites</p>
        </div>

        <div class="space-y-4 max-h-[550px] overflow-y-auto pr-1">
          {reportsList.length === 0 ? (
            <div class="text-center py-12 text-slate-500 text-xs select-none">
              No registered shift duty logs recorded. Ready to file active deployments.
            </div>
          ) : (
            reportsList.map((rep) => (
              <div key={rep.id} class="p-4 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition duration-150">
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <span class="p-1 px-2.5 rounded-lg bg-slate-850 border border-slate-850 text-[10px] text-slate-300 font-mono">
                      LOG #{rep.id}
                    </span>
                    <span class={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                      rep.duty_status.includes('Incident') 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    }`}>
                      {rep.duty_status}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    <div class="flex items-center space-x-1 text-xs text-slate-300">
                      <MapPin class="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span class="font-semibold">{rep.site_name}</span>
                    </div>
                    <div class="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                      <Clock class="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{rep.shift_time}</span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-400 leading-relaxed font-sans">{rep.remarks || 'No handover remarks.'}</p>
                  
                  {rep.incident_details && (
                    <div class="p-2.5 bg-red-950/20 border border-red-900/30 rounded-xl">
                      <span class="text-[9px] text-red-400 font-bold uppercase tracking-wider block mb-0.5">⚠️ Reported Incident Details</span>
                      <p class="text-xs text-red-200 mt-0.5 font-mono">{rep.incident_details}</p>
                    </div>
                  )}

                  <div class="flex items-center space-x-2 pt-1">
                    <span class="text-[10px] text-slate-500 hover:text-slate-400">By Officer: <strong class="text-slate-400 font-medium">{rep.guard_name || 'My Self'}</strong></span>
                    <span class="text-[10px] text-slate-650">•</span>
                    <span class="text-[10px] text-slate-500 font-mono">{rep.date_time}</span>
                  </div>
                </div>

                <div class="flex sm:flex-col items-center justify-end gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    id={`print-duty-rep-${rep.id}`}
                    onClick={() => handlePrintIndividualReport(rep)}
                    class="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-300 hover:text-white transition"
                    title="Print Tour Document Detail"
                  >
                    <Printer class="w-4 h-4" />
                  </button>

                  {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && onDeleteReport && (
                    <button
                      id={`delete-duty-rep-${rep.id}`}
                      onClick={() => {
                        if (confirm('Are you absolutely sure you wish to delete this SQLite log index?')) {
                          onDeleteReport(rep.id);
                        }
                      }}
                      class="p-2 rounded-xl bg-rose-500/10 border border-rose-550/10 hover:bg-rose-500 text-rose-450 hover:text-white transition"
                      title="Delete log"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
