/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CalendarRange, 
  UserCheck, 
  XSquare, 
  Clock, 
  HelpCircle, 
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { LeaveRequest, UserProfile } from '../types';

interface LeaveViewProps {
  user: UserProfile | null;
  leavesList: LeaveRequest[];
  onApplyLeave: (payload: { reason: string; start_date: string; end_date: string; emergency_contact: string }) => Promise<void>;
  onApproveRejectLeave: (id: number, status: 'Approved' | 'Rejected', remarks: string) => Promise<void>;
}

export const LeaveView: React.FC<LeaveViewProps> = ({ user, leavesList, onApplyLeave, onApproveRejectLeave }) => {
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeAdminLeaveId, setActiveAdminLeaveId] = useState<number | null>(null);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !startDate || !endDate || !emergencyContact) {
      alert('All fields must be filled correctly');
      return;
    }

    setSubmitting(true);
    try {
      await onApplyLeave({ reason, start_date: startDate, end_date: endDate, emergency_contact: emergencyContact });
      setReason('');
      setEmergencyContact('');
      alert('Absence and Leave request filed successfully! Operational roster managers notified.');
    } catch (err: any) {
      alert(err.message || 'Verification failed filing leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id: number, decision: 'Approved' | 'Rejected') => {
    try {
      await onApproveRejectLeave(id, decision, adminRemarks);
      setActiveAdminLeaveId(null);
      setAdminRemarks('');
      alert(`Leave request has been marked as ${decision}`);
    } catch (err: any) {
      alert(err.message || 'Decision failed');
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Apply Leave Panel */}
      <div class="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3 mb-4">
          <CalendarRange class="w-5 h-5 text-blue-400" />
          <h2 class="font-bold text-sm text-white tracking-tight">Apply for Absence</h2>
        </div>

        <form onSubmit={handleApplySubmit} class="space-y-4">
          {/* Reason */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Reason for Leave</label>
            <input
              id="leave-reason"
              type="text"
              placeholder="Medical issue, personal, festive holidays..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-700"
            />
          </div>

          {/* Dates */}
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Start Date</label>
              <input
                id="leave-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">End Date</label>
              <input
                id="leave-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 font-mono"
              />
            </div>
          </div>

          {/* Emergency Mobile */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Emergency Contact No</label>
            <input
              id="leave-emergency-contact"
              type="text"
              placeholder="Name & primary cell number..."
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-700"
            />
          </div>

          <button
            id="submit-leave-button"
            type="submit"
            disabled={submitting}
            class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none border border-blue-500/20 transition"
          >
            {submitting ? 'Registering request...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Leave Status Ledger Table */}
      <div id="leave-registry-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-sm tracking-tight text-white">Absence & Leave Registry</h2>
          <p class="text-[10px] text-slate-500 font-mono">Operations shift coverage tracking</p>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40 select-none">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                <th class="p-3">Employee Name</th>
                <th class="p-3">Requested Range</th>
                <th class="p-3">Emergency / Reason</th>
                <th class="p-3 text-center">Status</th>
                {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && (
                  <th class="p-3 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody class="text-xs text-slate-300 divide-y divide-slate-850">
              {leavesList.length === 0 ? (
                <tr>
                  <td colSpan={5} class="p-6 text-center text-slate-500">
                    No matching leave records registered in relational DB index.
                  </td>
                </tr>
              ) : (
                leavesList.map((req) => (
                  <tr key={req.id} class="hover:bg-slate-900/10 transition">
                    <td class="p-3">
                      <div class="font-semibold text-slate-100">{req.employee_name || 'Owner Profile'}</div>
                      <div class="text-[9px] text-slate-550 font-mono mt-0.5 uppercase">ID: {req.employee_id || 'Owner ID'}</div>
                    </td>
                    <td class="p-3 font-mono">
                      <div class="text-slate-300">{req.start_date}</div>
                      <div class="text-[10px] text-slate-500">to {req.end_date}</div>
                    </td>
                    <td class="p-3">
                      <div class="text-slate-200 line-clamp-1">{req.reason}</div>
                      <div class="text-[10px] text-slate-500 font-mono">Emergency: {req.emergency_contact}</div>
                    </td>
                    <td class="p-3 text-center">
                      <span class={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        req.status === 'Approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : req.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-550/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {req.status === 'Approved' ? (
                          <CheckCircle class="w-2.5 h-2.5" />
                        ) : req.status === 'Rejected' ? (
                          <XSquare class="w-2.5 h-2.5" />
                        ) : (
                          <Clock class="w-2.5 h-2.5" />
                        )}
                        <span>{req.status}</span>
                      </span>
                      {req.remarks && (
                        <p class="text-[10px] text-slate-500 font-serif italic mt-1">"{req.remarks}"</p>
                      )}
                    </td>
                    {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && (
                      <td class="p-3 text-right">
                        {req.status === 'Pending' ? (
                          activeAdminLeaveId === req.id ? (
                            <div class="space-y-1.5 shrink-0">
                              <input
                                id={`leave-rem-input-${req.id}`}
                                type="text"
                                placeholder="Decision remarks..."
                                value={adminRemarks}
                                onChange={(e) => setAdminRemarks(e.target.value)}
                                class="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] p-1.5 rounded focus:outline-none w-32"
                              />
                              <div class="flex items-center justify-end space-x-1">
                                <button
                                  id={`leave-approve-${req.id}`}
                                  onClick={() => handleDecision(req.id, 'Approved')}
                                  class="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold"
                                >
                                  Approve
                                </button>
                                <button
                                  id={`leave-reject-${req.id}`}
                                  onClick={() => handleDecision(req.id, 'Rejected')}
                                  class="px-2 py-0.5 bg-rose-600 hover:bg-rose-750 text-white rounded text-[9px] font-bold"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              id={`leave-action-trigger-${req.id}`}
                              onClick={() => {
                                setActiveAdminLeaveId(req.id);
                                setAdminRemarks('');
                              }}
                              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[10px] font-bold transition border border-slate-700"
                            >
                              Decide
                            </button>
                          )
                        ) : (
                          <span class="text-[10px] text-slate-500">Processed</span>
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
