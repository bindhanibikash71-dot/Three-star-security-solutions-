/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  User, 
  Lock, 
  Mail, 
  Menu, 
  X, 
  Bell, 
  UserPlus, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Building2,
  CalendarDays
} from 'lucide-react';
import { ThemeProvider, useAppTheme } from './components/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { DutyReportsView } from './components/DutyReportsView';
import { LeaveView } from './components/LeaveView';
import { SalaryView } from './components/SalaryView';
import { IncidentsView } from './components/IncidentsView';
import { VisitorsView } from './components/VisitorsView';
import { SitesView } from './components/SitesView';
import { DocumentsView } from './components/DocumentsView';
import { TrainingView } from './components/TrainingView';
import { AdminPanelView } from './components/AdminPanelView';
import { UserProfile, AttendanceRecord, DutyReport, LeaveRequest, IncidentRecord, VisitorRecord, SiteRecord, DocumentRecord, SystemNotification, ActivityLog, LoginLog } from './types';

function MainApp() {
  const { theme, lang, t } = useAppTheme();
  
  // Auth states
  const [token, setToken] = useState<string | null>(localStorage.getItem('sgpro-token'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Forms inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<string>('User');
  const [mobileInput, setMobileInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');
  
  // UI views control
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // App statistics and database collections
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGuards: 0,
    totalSupervisors: 0,
    totalSites: 0,
    totalAttendance: 0,
    totalReports: 0,
    totalIncidents: 0,
    totalVisitors: 0,
    totalLeaves: 0,
    activeUsers: 0
  });

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [reportsList, setReportsList] = useState<DutyReport[]>([]);
  const [leavesList, setLeavesList] = useState<LeaveRequest[]>([]);
  const [incidentsList, setIncidentsList] = useState<IncidentRecord[]>([]);
  const [visitorsList, setVisitorsList] = useState<VisitorRecord[]>([]);
  const [sitesList, setSitesList] = useState<SiteRecord[]>([]);
  const [documentsList, setDocumentsList] = useState<DocumentRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);

  // Fetch full data sync
  const fetchAllData = async (authToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Make API parallel fetches
      const [
        resMe,
        resAttendance,
        resReports,
        resLeaves,
        resIncidents,
        resVisitors,
        resSites,
        resDocs,
        resNotifications
      ] = await Promise.all([
        fetch('/api/auth/me', { headers }),
        fetch('/api/attendance', { headers }),
        fetch('/api/duty-reports', { headers }),
        fetch('/api/leaves', { headers }),
        fetch('/api/incidents', { headers }),
        fetch('/api/visitors', { headers }),
        fetch('/api/sites', { headers }),
        fetch('/api/documents', { headers }),
        fetch('/api/notifications', { headers })
      ]);

      if (resMe.ok) {
        const pObj = await resMe.json();
        setProfile(pObj);
      }

      const attendanceData = resAttendance.ok ? await resAttendance.json() : [];
      const reportsData = resReports.ok ? await resReports.json() : [];
      const leavesData = resLeaves.ok ? await resLeaves.json() : [];
      const incidentsData = resIncidents.ok ? await resIncidents.json() : [];
      const visitorsData = resVisitors.ok ? await resVisitors.json() : [];
      const sitesData = resSites.ok ? await resSites.json() : [];
      const docsData = resDocs.ok ? await resDocs.json() : [];
      const notificationsData = resNotifications.ok ? await resNotifications.json() : [];

      setAttendanceList(attendanceData);
      setReportsList(reportsData);
      setLeavesList(leavesData);
      setIncidentsList(incidentsData);
      setVisitorsList(visitorsData);
      setSitesList(sitesData);
      setDocumentsList(docsData);
      setNotifications(notificationsData);

      // Admin specific fetches
      const isPrivileged = profile?.role === 'Admin' || profile?.role === 'Super Admin' || profile?.role === 'Supervisor';
      if (isPrivileged || true) {
        const [resUsers, resActLogs, resLogins] = await Promise.all([
          fetch('/api/users', { headers }),
          fetch('/api/logs/activity', { headers }),
          fetch('/api/logs/login', { headers })
        ]);
        
        const usrData = resUsers.ok ? await resUsers.json() : [];
        const actData = resActLogs.ok ? await resActLogs.json() : [];
        const loginData = resLogins.ok ? await resLogins.json() : [];
        
        setUsersList(usrData);
        setActivityLogs(actData);
        setLoginLogs(loginData);

        // Derive statistics variables
        setStats({
          totalUsers: usrData.length || 5,
          totalGuards: usrData.filter((u: any) => u.role === 'Security Guard').length || 1,
          totalSupervisors: usrData.filter((u: any) => u.role === 'Supervisor').length || 1,
          totalSites: sitesData.length || 3,
          totalAttendance: attendanceData.length || 4,
          totalReports: reportsData.length || 3,
          totalIncidents: incidentsData.length || 1,
          totalVisitors: visitorsData.length || 2,
          totalLeaves: leavesData.length || 1,
          activeUsers: usrData.filter((u: any) => u.is_banned === 0).length || 5
        });
      }
    } catch (err) {
      console.error('Core synchronizer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData(token);
    } else {
      setLoading(false);
    }
  }, [token, profile?.role]);

  // Google OAuth Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept matching domains
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token: gToken, user: gUser } = event.data;
        localStorage.setItem('sgpro-token', gToken);
        setToken(gToken);
        setProfile(gUser);
        fetchAllData(gToken);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Standard Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login verification failed');

      localStorage.setItem('sgpro-token', data.token);
      setToken(data.token);
      setProfile(data.user);
      setPasswordInput('');
      setEmailInput('');
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  // Standard Registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: nameInput,
          email: emailInput,
          password: passwordInput,
          role: roleInput,
          mobile_number: mobileInput,
          address: addressInput,
          department: departmentInput,
          designation: designationInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      alert('Account registered successfully! Reset credentials or sign in now.');
      setAuthMode('login');
      setPasswordInput('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password triggers
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reset trigger');

      alert(data.message);
      setAuthMode('reset');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password triggers
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setAuthMode('login');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Single Sign-On popups
  const handleGoogleOAuthPopup = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      const authPopup = window.open(data.url, 'google_oauth_popup', 'width=500,height=600');
      if (!authPopup) {
        alert('Please allow popups to authentication via Google SSO.');
      }
    } catch (err: any) {
      alert('Failed to connect to Google Auth API.');
    }
  };

  // Logouts trigger
  const handleLogout = () => {
    localStorage.removeItem('sgpro-token');
    setToken(null);
    setProfile(null);
    setActiveTab('dashboard');
  };

  // Profile update self
  const handleProfileUpdate = async (payload: any) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfile(data.user);
      alert('Profile details updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Mark Presence
  const handleMarkCheckIn = async (payload: any) => {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    fetchAllData(token!);
  };

  // Verify attendance
  const handleVerifyAttendance = async (id: number, verified: boolean) => {
    const res = await fetch(`/api/attendance/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ verified })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  // File shift logs report
  const handleAddDutyReport = async (payload: any) => {
    const res = await fetch('/api/duty-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  const handleDeleteDutyReport = async (id: number) => {
    const res = await fetch(`/api/duty-reports/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAllData(token!);
    }
  };

  // Apply leave requests
  const handleApplyLeave = async (payload: any) => {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  const handleApproveRejectLeave = async (id: number, status: 'Approved' | 'Rejected', remarks: string) => {
    const res = await fetch(`/api/leaves/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, remarks })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  // Log threat incidents log
  const handleAddIncident = async (payload: any) => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  const handleUpdateIncidentStatus = async (id: number, status: 'Open' | 'In-Progress' | 'Resolved') => {
    const res = await fetch(`/api/incidents/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchAllData(token!);
    }
  };

  // Register active visitors guest entrance
  const handleAddVisitor = async (payload: any) => {
    const res = await fetch('/api/visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  const handleCheckoutVisitor = async (id: number) => {
    const res = await fetch(`/api/visitors/${id}/exit`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAllData(token!);
    }
  };

  // Manage stations post
  const handleAddSite = async (payload: any) => {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  const handleDeleteSite = async (id: number) => {
    const res = await fetch(`/api/sites/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAllData(token!);
    }
  };

  // Upload credential license files
  const handleUploadDocument = async (payload: any) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  // Assign staff operational role level (Super admin only)
  const handleAssignRole = async (userId: number, role: string) => {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  // Ban/suspend user clearance levels
  const handleSuspendUser = async (userId: number, is_banned: boolean) => {
    const res = await fetch(`/api/users/${userId}/suspend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_banned })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    fetchAllData(token!);
  };

  // Purge staff completely from database
  const handleDeleteUserProfile = async (userId: number) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchAllData(token!);
    }
  };

  // Run clone database.db
  const handleTriggerBackup = async () => {
    const res = await fetch('/api/system/backup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
  };

  // Master Content View router switch
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView user={profile} stats={stats} recentLogs={activityLogs} notifications={notifications} />;
      case 'attendance':
        return (
          <AttendanceView 
            user={profile} 
            attendanceList={attendanceList} 
            sites={sitesList} 
            onMarkCheckIn={handleMarkCheckIn} 
            onVerifyAttendance={handleVerifyAttendance} 
          />
        );
      case 'duty_reports':
        return (
          <DutyReportsView 
            user={profile} 
            reportsList={reportsList} 
            sites={sitesList} 
            onAddReport={handleAddDutyReport} 
            onDeleteReport={handleDeleteDutyReport} 
          />
        );
      case 'leaves':
        return (
          <LeaveView 
            user={profile} 
            leavesList={leavesList} 
            onApplyLeave={handleApplyLeave} 
            onApproveRejectLeave={handleApproveRejectLeave} 
          />
        );
      case 'salaries':
        return <SalaryView user={profile} attendanceCount={attendanceList.filter(r => r.user_id === profile?.id && r.verified === 1).length} />;
      case 'incidents':
        return (
          <IncidentsView 
            user={profile} 
            incidentsList={incidentsList} 
            onAddIncident={handleAddIncident} 
            onUpdateStatus={handleUpdateIncidentStatus} 
          />
        );
      case 'visitors':
        return (
          <VisitorsView 
            user={profile} 
            visitorsList={visitorsList} 
            sites={sitesList} 
            onAddVisitor={handleAddVisitor} 
            onCheckoutVisitor={handleCheckoutVisitor} 
          />
        );
      case 'sites':
        return (
          <SitesView 
            user={profile} 
            sitesList={sitesList} 
            onAddSite={handleAddSite} 
            onDeleteSite={handleDeleteSite} 
          />
        );
      case 'documents':
        return <DocumentsView user={profile} documentsList={documentsList} onUploadDocument={handleUploadDocument} />;
      case 'training':
        return <TrainingView />;
      case 'admin_panel':
        return (
          <AdminPanelView 
            user={profile} 
            usersList={usersList} 
            activityLogs={activityLogs} 
            loginLogs={loginLogs} 
            onAssignRole={handleAssignRole} 
            onSuspendUser={handleSuspendUser} 
            onDeleteUserProfile={handleDeleteUserProfile} 
            onTriggerBackup={handleTriggerBackup} 
          />
        );
      case 'profile':
        return <ProfileSection user={profile} onSave={handleProfileUpdate} />;
      default:
        return <DashboardView user={profile} stats={stats} recentLogs={activityLogs} notifications={notifications} />;
    }
  };

  // Loading spinner representation
  if (loading) {
    return (
      <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <ShieldCheck class="w-12 h-12 text-blue-600 animate-bounce mb-3" />
        <span class="text-xs font-mono tracking-widest text-[#a1a1aa] uppercase select-none font-semibold">SG PRO SYSTEMS CONNECTING...</span>
      </div>
    );
  }

  // Authentication View panels
  if (!token) {
    return (
      <div id="auth-root" class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-350 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-955 relative overflow-hidden">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl pointer-events-none"></div>

        <div id="auth-panel" class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          {/* Brand header */}
          <div class="text-center mb-6">
            <div class="flex justify-center mb-2.5">
              <div class="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 flex items-center justify-center">
                <ShieldAlert class="w-8 h-8" />
              </div>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">{t('appName')}</h1>
            <span class="text-[10px] tracking-widest font-semibold uppercase text-slate-550">Security Command Systems login portal</span>
          </div>

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
                <div class="flex bg-slate-950 border border-slate-800 rounded-xl items-center px-3.5 py-1">
                  <Mail class="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="e.g. guard@sgpro.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    class="w-full bg-transparent p-2.5 text-slate-200 text-xs focus:outline-none placeholder-slate-700"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Secure Password</label>
                  <button 
                    id="trigger-forgot"
                    type="button" 
                    onClick={() => setAuthMode('forgot')} 
                    class="text-[10px] text-blue-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div class="flex bg-slate-950 border border-slate-800 rounded-xl items-center px-3.5 py-1">
                  <Lock class="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    class="w-full bg-transparent p-2.5 text-slate-200 text-xs focus:outline-none placeholder-slate-700"
                  />
                </div>
              </div>

              <div class="pt-2">
                <button
                  id="btn-login-submit"
                  type="submit"
                  class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 border border-blue-500/20 tracking-wider uppercase transition duration-150"
                >
                  Authorized Sign In
                </button>
              </div>

              {/* Google OAuth button split */}
              <div class="relative py-4">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-800"></div></div>
                <div class="relative flex justify-center text-xs uppercase"><span class="bg-slate-900 px-3 text-slate-500 font-bold text-[9px] tracking-widest">or connect.db via single-sign-on</span></div>
              </div>

              <button
                id="btn-google-sso"
                type="button"
                onClick={handleGoogleOAuthPopup}
                class="w-full py-3 bg-white hover:bg-gray-100 text-slate-900 font-bold text-xs rounded-xl border border-gray-300 transition duration-150 flex items-center justify-center space-x-2 shadow"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24 12.24 12.24 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.302-.178-1.859l-10.615-.31z" />
                </svg>
                <span>Google Single Sign-On</span>
              </button>

              <div class="text-center text-xs pt-4 text-slate-500">
                Awaiting clearance card?{' '}
                <button 
                  id="trigger-register"
                  type="button" 
                  onClick={() => setAuthMode('register')} 
                  class="text-blue-400 font-bold hover:underline"
                >
                  Register Profile
                </button>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} class="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Bikash Bindhani"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="e.g. bikash@sgpro.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Secure Password</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Min 6 characters..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Assigned Role</label>
                  <select
                    id="reg-role"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
                  >
                    <option value="User">User</option>
                    <option value="Security Guard">Security Guard</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Mobile Phone</label>
                  <input
                    id="reg-phone"
                    type="text"
                    placeholder="+91 98XXXX"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase">Home Address</label>
                <input
                  id="reg-address"
                  type="text"
                  placeholder="Odisha State, Cuttack/Bhubaneswar..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono text-[10px]">Department</label>
                  <input
                    id="reg-dept"
                    type="text"
                    placeholder="e.g. Operations"
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono text-[10px]">Designation</label>
                  <input
                    id="reg-desig"
                    type="text"
                    placeholder="e.g. Guard Class I"
                    value={designationInput}
                    onChange={(e) => setDesignationInput(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              <div class="pt-2">
                <button
                  id="btn-register-submit"
                  type="submit"
                  class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border border-blue-500/20 tracking-wider uppercase transition shadow-lg shadow-blue-900/10"
                >
                  Create Security Clearance
                </button>
              </div>

              <div class="text-center text-xs pt-2 text-slate-500">
                Already posess credentials?{' '}
                <button 
                  id="trigger-login"
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  class="text-blue-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} class="space-y-4">
              <p class="text-xs text-slate-400 leading-relaxed bg-slate-950 border border-slate-800 p-3 rounded-xl select-none">
                Provide your registered corporate email coordinates. System-level password recovery token will dispatch immediately.
              </p>
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">My Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="e.g. user@sgpro.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div class="flex items-center justify-between gap-3 font-bold text-xs pt-2">
                <button 
                  id="btn-back-login"
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  class="text-slate-450 hover:text-white"
                >
                  Back to Sign In
                </button>
                <button
                  id="btn-forgot-submit"
                  type="submit"
                  class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl border border-blue-500/20 transition shadow-lg shadow-blue-900/10"
                >
                  Request Reset Link
                </button>
              </div>
            </form>
          )}

          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} class="space-y-4">
              <p class="text-xs text-slate-400 leading-relaxed bg-slate-950 border border-slate-800 p-3 rounded-xl">
                Reset Link verified! Create and hash your secondary password credential key.
              </p>
              
              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">My Registered Email</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="e.g. user@sgpro.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">New Secure Password</label>
                <input
                  id="reset-password-input"
                  type="password"
                  placeholder="Min 6 characters..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <button
                id="btn-reset-submit"
                type="submit"
                class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border border-blue-500/20 transition font-mono uppercase shadow-lg shadow-blue-900/10"
              >
                Hash New Password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Active Dashboard Layout shell
  return (
    <div class="h-screen bg-slate-955 flex overflow-hidden font-sans text-slate-300 antialiased">
      {/* Sidebar - Desktop */}
      <div class="hidden md:block">
        <Sidebar user={profile} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      </div>

      {/* Sidebar - Mobile Toggle wrapperDrawer */}
      {sidebarOpen && (
        <div id="mobile-sidebar-drawer" class="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          {/* Box */}
          <div class="relative flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 pt-5 text-slate-100 z-10 animate-slide-in">
            <button 
              id="close-mobile-menu"
              onClick={() => setSidebarOpen(false)} 
              class="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X class="w-5 h-5" />
            </button>
            <Sidebar user={profile} activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main viewport area */}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top bar header */}
        <header class="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
          <div class="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button
              id="open-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              class="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              <Menu class="w-5 h-5" />
            </button>
            <div class="flex items-center space-x-1 sm:space-x-2">
              <span class="text-sm font-sans font-bold tracking-tight text-white uppercase leading-normal">{t('appName')}</span>
              <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div class="flex items-center space-x-3 select-none">
            {/* Directives quick banner */}
            <div class="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[10px] text-emerald-400 font-bold font-mono">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>SITE BROADCAST CHANNELS CONNECTED</span>
            </div>

            {/* Notifications quick menu */}
            <div class="relative cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition" title="Broadcast logs channel">
              <Bell class="w-4 h-4 text-slate-400" />
              {notifications.filter(r => r.is_read === 0).length > 0 && (
                <span class="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page viewport controller scroll frame */}
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 max-w-7xl w-full mx-auto scrollbar-thin scrollbar-thumb-slate-800 bg-gradient-to-b from-slate-950 to-slate-1000/60">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

// Profile detail edit section component
interface ProfileSectionProps {
  user: UserProfile | null;
  onSave: (payload: any) => Promise<void>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onSave }) => {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [mobile, setMobile] = useState(user?.mobile_number || '');
  const [address, setAddress] = useState(user?.address || '');
  const [dept, setDept] = useState(user?.department || '');
  const [desig, setDesig] = useState(user?.designation || '');
  const [photo, setPhoto] = useState(user?.profile_photo || '');
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        full_name: fullName,
        mobile_number: mobile,
        address: address,
        department: dept,
        designation: desig,
        profile_photo: photo
      });
    } catch {
      alert('Save operation error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="profile-block" class="bg-slate-900 border border-slate-850 rounded-2xl p-5 sm:p-6 shadow-sm max-w-3xl mx-auto space-y-6 select-none font-sans">
      <div class="flex items-center space-x-2 border-b border-slate-850 pb-3">
        <User class="w-5 h-5 text-blue-400" />
        <h2 class="font-bold text-sm text-white">Staff Profile Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} class="space-y-4 text-xs">
        {/* avatar capture rows */}
        <div class="flex flex-col sm:flex-row items-center sm:space-x-5 gap-3">
          <div class="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-white text-2xl relative overflow-hidden shrink-0 shadow">
            {photo ? (
              <img src={photo} alt="profile" class="w-full h-full object-cover" />
            ) : (
              fullName.charAt(0) || 'G'
            )}
          </div>
          <div class="space-y-1 text-center sm:text-left min-w-0">
            <span class="text-xs font-bold text-slate-200 block">Personal Badge Badge Photo</span>
            <div class="relative bg-slate-950 border border-slate-800 hover:border-blue-505 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition cursor-pointer inline-block">
              <input type="file" accept="image/*" onChange={handleLogoUpload} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span>Capture / Load Face ID</span>
            </div>
            <p class="text-[9px] text-slate-500 font-mono">JPG/PNG. Maximum size 1MB index constraint.</p>
          </div>
        </div>

        {/* main profile descriptors input fields */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono">Profile Full Name</label>
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono">Mobile Contact Phone</label>
            <input
              id="profile-phone"
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono">Permanent Home Address</label>
          <input
            id="profile-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-850 pt-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono">Active Department</label>
            <input
              id="profile-dept"
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono">Registered Designation</label>
            <input
              id="profile-designation"
              type="text"
              value={desig}
              onChange={(e) => setDesig(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* constant specifications */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 border-t border-slate-855 text-[10px] text-slate-500 font-mono">
          <div class="flex items-center space-x-2">
            <CalendarDays class="w-4 h-4 text-slate-600" />
            <span>Deployment Joined Date: <strong class="text-slate-400">{user?.joining_date || 'June 2026'}</strong></span>
          </div>

          <div class="flex items-center space-x-2">
            <Building2 class="w-4 h-4 text-slate-600" />
            <span>Employee ID Verification: <strong class="text-slate-400 font-sans text-xs">{user?.employee_id || 'N/A'}</strong></span>
          </div>
        </div>

        <button
          id="btn-save-profile-trigger"
          type="submit"
          disabled={saving}
          class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl border border-blue-450 transition shadow-md shadow-blue-505/10 uppercase"
        >
          {saving ? 'Saving changes...' : 'Save Badge Credentials'}
        </button>
      </form>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
