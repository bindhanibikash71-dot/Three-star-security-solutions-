/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { 
  ShieldAlert, 
  UserCheck, 
  ClipboardList, 
  Calendar, 
  Users, 
  BellRing, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  stats: {
    totalUsers: number;
    totalGuards: number;
    totalSupervisors: number;
    totalSites: number;
    totalAttendance: number;
    totalReports: number;
    totalIncidents: number;
    totalVisitors: number;
    totalLeaves: number;
    activeUsers: number;
  };
  recentLogs: any[];
  notifications: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, stats, recentLogs, notifications }) => {
  const { t } = useAppTheme();

  // Synthetic charts dataset corresponding to Security Guard Pro operations
  const attendanceTrendData = [
    { name: 'Mon', Present: stats.totalAttendance > 5 ? stats.totalAttendance - 2 : 12, Absent: 2, ExtraShifts: 3 },
    { name: 'Tue', Present: stats.totalAttendance > 5 ? stats.totalAttendance - 1 : 14, Absent: 1, ExtraShifts: 2 },
    { name: 'Wed', Present: stats.totalAttendance > 5 ? stats.totalAttendance : 15, Absent: 0, ExtraShifts: 4 },
    { name: 'Thu', Present: stats.totalAttendance > 5 ? stats.totalAttendance + 1 : 13, Absent: 2, ExtraShifts: 3 },
    { name: 'Fri', Present: stats.totalAttendance > 5 ? stats.totalAttendance + 2 : 16, Absent: 0, ExtraShifts: 5 },
    { name: 'Sat', Present: stats.totalAttendance > 5 ? stats.totalAttendance - 3 : 11, Absent: 4, ExtraShifts: 1 },
    { name: 'Sun', Present: stats.totalAttendance > 5 ? stats.totalAttendance - 5 : 8, Absent: 6, ExtraShifts: 0 },
  ];

  const categoryIncidentData = [
    { month: 'Jan', Intrusions: 2, FireSafety: 0, AssetsOK: 10 },
    { month: 'Feb', Intrusions: 1, FireSafety: 1, AssetsOK: 12 },
    { month: 'Mar', Intrusions: 3, FireSafety: 0, AssetsOK: 9 },
    { month: 'Apr', Intrusions: 0, FireSafety: 2, AssetsOK: 14 },
    { month: 'May', Intrusions: stats.totalIncidents > 2 ? stats.totalIncidents - 1 : 1, FireSafety: 0, AssetsOK: 11 },
    { month: 'Jun', Intrusions: stats.totalIncidents, FireSafety: 1, AssetsOK: 15 },
  ];

  const kpis = [
    { id: 'guards', title: 'On-Duty Guard Force', value: stats.totalGuards, sub: 'Assigned to active posts', icon: Award, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'attendance', title: 'Verified Presences', value: stats.totalAttendance, sub: 'Logs recorded this month', icon: UserCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'incidents', title: 'Critical Alert Tickets', value: stats.totalIncidents, sub: 'Needs operational response', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'visitors', title: 'Valid Guest Admissions', value: stats.totalVisitors, sub: 'Registered at log checkpoints', icon: Users, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div class="space-y-6">
      {/* Top Welcome Title */}
      <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="font-sans text-2xl font-bold tracking-tight text-white mb-1">
              {t('welcomeBack')} {user?.full_name}!
            </h1>
            <p class="text-slate-400 text-sm max-w-xl">
              SG Pro Digital Command Portal. Status: <span class="text-emerald-400 font-semibold inline-flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>Fully Operational</span>. Track guard shifts, incident tickets, guest registries, and safety performance securely.
            </p>
          </div>
          <div class="flex items-center space-x-2 bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl self-start md:self-auto shrink-0">
            <Calendar class="w-4 h-4 text-blue-400" />
            <span class="text-xs font-mono text-slate-350">{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div id={`kpi-card-${kpi.id}`} key={kpi.id} class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition duration-300">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-500 tracking-wide uppercase">{kpi.title}</span>
                <div class={`p-1.5 border rounded-lg ${kpi.color}`}>
                  <Icon class="w-4 h-4" />
                </div>
              </div>
              <div class="flex items-baseline space-x-2">
                <span class="text-2xl font-bold font-sans text-white">{kpi.value}</span>
                <div class="flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <TrendingUp class="w-3 h-3 mr-1" />
                  +12%
                </div>
              </div>
              <p class="text-[10px] text-slate-500 mt-2 font-mono truncate">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts & Trends Block */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Flow Tracker */}
        <div id="attendance-flow-section" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-7">
          <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h2 class="font-bold text-sm tracking-tight text-white mb-0.5">Attendance & Operations Velocity</h2>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Weekly verification metrics representation</p>
            </div>
            <div class="flex items-center space-x-3 text-xs">
              <span class="inline-flex items-center text-slate-400">
                <span class="w-2.5 h-2.5 rounded bg-blue-600 mr-1.5"></span>
                Present
              </span>
              <span class="inline-flex items-center text-slate-400">
                <span class="w-2.5 h-2.5 rounded bg-rose-500 mr-1.5"></span>
                Absent
              </span>
            </div>
          </div>
          <div class="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Bar dataKey="Present" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Events Risk Index */}
        <div id="risk-events-section" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-5">
          <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h2 class="font-bold text-sm tracking-tight text-white mb-0.5">Critical Incident Diagnostics</h2>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Category indexing timeline (Jan - Jun)</p>
            </div>
            <span class="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
              Alert Index: Low
            </span>
          </div>
          <div class="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryIncidentData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="Intrusions" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="AssetsOK" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Logs & Real-Time Alerts */}
      <div id="audit-alerts-block" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time System Notifications */}
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-6">
          <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <BellRing class="w-4 h-4 text-blue-500 animate-pulse" />
              <h2 class="font-bold text-sm tracking-tight text-white">Broadcast Alerts & Directives</h2>
            </div>
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Feeds</span>
          </div>
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div class="text-center py-8 text-xs text-slate-500 select-none">
                No system notifications broadcasted. Check-ins are updated in live ledger.
              </div>
            ) : (
              notifications.map((n, idx) => {
                let badgeClr = 'bg-blue-600/10 text-blue-400 border-blue-500/20';
                if (n.type === 'incident') badgeClr = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                if (n.type === 'leave') badgeClr = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                return (
                  <div key={idx} class="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-start space-x-3 hover:bg-slate-950/70 transition">
                    <span class={`p-1 border text-[9px] font-semibold tracking-wider uppercase rounded-md px-1.5 ${badgeClr}`}>
                      {n.type}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-slate-200">{n.title}</p>
                      <p class="text-[11px] text-slate-404 mt-0.5">{n.message}</p>
                      <span class="text-[9px] text-slate-500 font-mono mt-1 block">
                        {new Date(n.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Verified Guard Shift Activity Logs */}
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-6">
          <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <Activity class="w-4 h-4 text-emerald-500" />
              <h2 class="font-bold text-sm tracking-tight text-white">Roster Logs & Audit Trail</h2>
            </div>
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operational</span>
          </div>
          <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <div class="text-center py-8 text-xs text-slate-500 select-none">
                No registered field actions logged today. Check back during active shifts.
              </div>
            ) : (
              recentLogs.slice(0, 7).map((log, idx) => (
                <div key={idx} class="p-3 bg-slate-950/30 border border-slate-800 rounded-xl flex items-start justify-between space-x-3">
                  <div>
                    <p class="text-xs font-medium text-slate-300">{log.action}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                  </div>
                  <span class="text-[9px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
