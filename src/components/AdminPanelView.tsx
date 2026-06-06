/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  UserMinus, 
  UserCheck, 
  Search, 
  History, 
  HardDriveDownload,
  Fingerprint,
  CalendarCheck2,
  Trash2,
  Edit2,
  Lock,
  RefreshCw,
  Database
} from 'lucide-react';
import { UserProfile, ActivityLog, LoginLog } from '../types';

interface AdminPanelViewProps {
  user: UserProfile | null;
  usersList: UserProfile[];
  activityLogs: ActivityLog[];
  loginLogs: LoginLog[];
  onAssignRole: (id: number, role: string) => Promise<void>;
  onSuspendUser: (id: number, isBanned: boolean) => Promise<void>;
  onDeleteUserProfile: (id: number) => Promise<void>;
  onTriggerBackup: () => Promise<void>;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  user,
  usersList,
  activityLogs,
  loginLogs,
  onAssignRole,
  onSuspendUser,
  onDeleteUserProfile,
  onTriggerBackup
}) => {
  const [activeSegment, setActiveSegment] = useState<'users' | 'activity' | 'logins' | 'backup'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState('');
  const [processing, setProcessing] = useState(false);

  const filteredUsers = usersList.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChangeSubmit = async (userId: number) => {
    if (!newSelectedRole) return;
    setProcessing(true);
    try {
      await onAssignRole(userId, newSelectedRole);
      setEditingUserId(null);
      alert('Clearance Role reassigned in database successfully!');
    } catch (err: any) {
      alert(err.message || 'Restricted action');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackupTrigger = async () => {
    setProcessing(true);
    try {
      await onTriggerBackup();
      alert('Relational image database.db cloned to /backups folder checkpoint successfully!');
    } catch (err: any) {
      alert(err.message || 'Backup failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div class="space-y-6">
      {/* Tab Segment Controls Header */}
      <div class="flex items-center space-x-1.5 border-b border-slate-850 pb-2.5 overflow-x-auto">
        <button
          id="btn-tab-users"
          onClick={() => { setActiveSegment('users'); setSearchQuery(''); }}
          class={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center space-x-2 ${
            activeSegment === 'users' 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'text-slate-450 hover:bg-slate-855'
          }`}
        >
          <Users class="w-4 h-4" />
          <span>Staff Directory</span>
        </button>

        <button
          id="btn-tab-activities"
          onClick={() => { setActiveSegment('activity'); setSearchQuery(''); }}
          class={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center space-x-2 ${
            activeSegment === 'activity' 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'text-slate-450 hover:bg-slate-855'
          }`}
        >
          <History class="w-4 h-4" />
          <span>Audit Logs</span>
        </button>

        <button
          id="btn-tab-logins"
          onClick={() => { setActiveSegment('logins'); setSearchQuery(''); }}
          class={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center space-x-2 ${
            activeSegment === 'logins' 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'text-slate-450 hover:bg-slate-855'
          }`}
        >
          <Fingerprint class="w-4 h-4" />
          <span>Devices & Logins</span>
        </button>

        {user?.role === 'Super Admin' && (
          <button
            id="btn-tab-backup"
            onClick={() => setActiveSegment('backup')}
            class={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 flex items-center space-x-2 ${
              activeSegment === 'backup' 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-450 hover:bg-slate-855'
            }`}
          >
            <Database class="w-4 h-4" />
            <span>Database Backup</span>
          </button>
        )}
      </div>

      {/* Users directory segment */}
      {activeSegment === 'users' && (
        <div id="segment-users-view" class="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
            <div>
              <h2 class="font-bold text-sm text-white">Staff Credentials Directory</h2>
              <p class="text-[10px] text-slate-500 font-mono">SQLite indexed profile profiles list</p>
            </div>

            <div class="bg-slate-950 border border-slate-850 flex items-center px-3 py-1.5 rounded-xl text-xs w-full sm:w-64">
              <Search class="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                id="staff-search-input"
                type="text"
                placeholder="Search staff Name, ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                class="bg-transparent border-0 text-slate-200 text-xs focus:outline-none w-full placeholder-slate-700"
              />
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40 select-none">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-950 border-b border-slate-855 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <th class="p-3">Profile Detalls</th>
                  <th class="p-3">Roster Role</th>
                  <th class="p-3">Joined Date</th>
                  <th class="p-3">Activity Status</th>
                  <th class="p-3 text-right">Roster Actions</th>
                </tr>
              </thead>
              <tbody class="text-slate-300 divide-y divide-slate-850">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} class="p-6 text-center text-slate-500">
                      No matching user accounts recorded.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === user?.id;
                    return (
                      <tr key={u.id} class="hover:bg-slate-900/10">
                        <td class="p-3">
                          <div class="font-bold text-slate-150 leading-tight">{u.full_name} {isSelf && <span class="text-[9px] text-blue-400 bg-blue-600/10 px-1.5 py-0.5 rounded font-semibold ml-1 shrink-0">MY SELF</span>}</div>
                          <div class="text-[10px] text-slate-500 font-mono mt-0.5">{u.email} • {u.employee_id}</div>
                          <div class="text-[10px] text-slate-400 font-sans mt-0.5">{u.department} ({u.designation})</div>
                        </td>
                        <td class="p-3">
                          {editingUserId === u.id ? (
                            <div class="flex items-center space-x-1">
                              <select
                                id={`edit-role-select-${u.id}`}
                                value={newSelectedRole}
                                onChange={(e) => setNewSelectedRole(e.target.value)}
                                class="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] p-1.5 rounded focus:outline-none focus:border-blue-500"
                              >
                                <option value="">- Role -</option>
                                <option value="User">User</option>
                                <option value="Security Guard">Security Guard</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                              </select>
                              <button
                                id={`save-role-btn-${u.id}`}
                                onClick={() => handleRoleChangeSubmit(u.id)}
                                disabled={processing}
                                class="p-1 px-2 bg-blue-600 hover:bg-blue-700 rounded text-[9px] font-bold text-white shadow"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <span class="font-bold font-mono text-blue-400 uppercase tracking-wide text-[10px]">
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td class="p-3 text-slate-450 font-mono">{u.joining_date || 'N/A'}</td>
                        <td class="p-3">
                          <span class={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${
                            u.is_banned === 0 
                              ? 'bg-emerald-550/10 text-emerald-450 border-emerald-550/20' 
                              : 'bg-rose-500/10 text-rose-450 border-rose-550/25'
                          }`}>
                            {u.is_banned === 0 ? 'ACTIVE' : 'BANNED / LOCKED'}
                          </span>
                        </td>
                        <td class="p-3 text-right">
                          <div class="flex items-center justify-end space-x-2">
                            {/* Edit check for superadmin roles */}
                            {user?.role === 'Super Admin' && !isSelf && (
                              <button
                                id={`trigger-edit-role-${u.id}`}
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setNewSelectedRole(u.role);
                                }}
                                class="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                                title="Edit role level"
                              >
                                <Edit2 class="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Enable/Disable Ban triggers */}
                            {!isSelf && (
                              <button
                                id={`trigger-ban-${u.id}`}
                                onClick={() => onSuspendUser(u.id, u.is_banned === 0)}
                                class={`p-1.5 rounded transition ${
                                  u.is_banned === 0 
                                    ? 'bg-rose-500/10 border border-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white' 
                                    : 'bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                }`}
                                title={u.is_banned === 0 ? 'Ban user account' : 'Pardon / Restore Account'}
                              >
                                <Lock class="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSelf && (
                              <button
                                id={`trigger-delete-user-${u.id}`}
                                onClick={() => {
                                  if (confirm(`Remove profile of ${u.full_name} and wipe completely from SQLite relational tables?`)) {
                                    onDeleteUserProfile(u.id);
                                  }
                                }}
                                class="p-1.5 bg-rose-500/5 hover:bg-rose-500 text-rose-400 hover:text-white rounded border border-rose-550/10 transition"
                                title="Delete user"
                              >
                                <Trash2 class="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit trails log segment */}
      {activeSegment === 'activity' && (
        <div id="segment-activity-view" class="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 class="font-bold text-sm text-white">System Security Audit Trail</h2>
            <p class="text-[10px] text-slate-500 font-mono">SQLite transaction activity logs journal</p>
          </div>

          <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div class="text-center py-12 text-slate-505 text-xs">
                Log Ledger empty. Transactions will index during user operations.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} class="p-3 bg-slate-950/40 border border-slate-850 rounded-xl leading-relaxed text-xs">
                  <div class="flex items-center justify-between gap-3 flex-wrap">
                    <span class="p-1 px-1.5 bg-blue-600/10 text-blue-400 rounded font-bold font-mono uppercase text-[9px] tracking-wide shrink-0">
                      {log.action}
                    </span>
                    <span class="text-[10px] text-slate-505 font-mono shrink-0">{log.timestamp}</span>
                  </div>
                  <p class="text-slate-350 font-sans mt-2">{log.details}</p>
                  
                  {log.full_name && (
                    <div class="text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-900/60">
                      Officer: <strong class="text-slate-400">{log.full_name}</strong> ({log.email}) • Level: {log.role}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Devices and login tracking segments */}
      {activeSegment === 'logins' && (
        <div id="segment-logins-view" class="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 class="font-bold text-sm text-white">Device Logins Ledger Tracker</h2>
            <p class="text-[10px] text-slate-500 font-mono">Session device identifiers tracking table</p>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40 select-none">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-950 border-b border-slate-850 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <th class="p-3">Staff Profile</th>
                  <th class="p-3">Login IP Address</th>
                  <th class="p-3">Device Identity</th>
                  <th class="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody class="text-slate-300 divide-y divide-slate-850">
                {loginLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} class="p-6 text-center text-slate-550">
                      Session registers index is clean. No active logins logged.
                    </td>
                  </tr>
                ) : (
                  loginLogs.map((log) => (
                    <tr key={log.id} class="hover:bg-slate-900/10">
                      <td class="p-3">
                        <div class="font-bold text-slate-200 leading-none">{log.full_name}</div>
                        <span class="text-[9px] text-slate-500 font-mono mt-1 block">{log.email}</span>
                      </td>
                      <td class="p-3 font-mono text-slate-400">{log.ip_address}</td>
                      <td class="p-3">
                        <div class="font-medium text-slate-300">{log.device_name}</div>
                        <div class="text-[9px] text-slate-500 font-mono truncate max-w-xs">{log.browser}</div>
                      </td>
                      <td class="p-3 text-slate-450 font-mono">{log.login_time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backup and clone database segment */}
      {activeSegment === 'backup' && (
        <div id="segment-backup-view" class="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <Database class="w-12 h-12 text-blue-450 mx-auto animate-pulse" />
          
          <div>
            <h3 class="font-bold text-slate-200">Writ Security snapshot clone</h3>
            <p class="text-xs text-slate-500 leading-relaxed mt-1">
              Triggering a database backup creates an image snapshot checkpoint copy of the active transaction file <code class="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-blue-400">database.db</code> and writes it directly inside <code class="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-slate-400">/backups</code> directory securely.
            </p>
          </div>

          <button
            id="admin-trigger-backup-btn"
            onClick={handleBackupTrigger}
            disabled={processing}
            class="p-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition border border-blue-500/20 shadow-md shadow-blue-500/10 inline-flex items-center space-x-2"
          >
            <HardDriveDownload class="w-4 h-4" />
            <span>{processing ? 'Cloning SQLite Database...' : 'Run Backup database.db'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
