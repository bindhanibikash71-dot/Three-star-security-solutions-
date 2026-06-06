/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  ClipboardList, 
  CalendarRange, 
  BadgeIndianRupee, 
  AlertTriangle, 
  Users, 
  MapPin, 
  FileLock, 
  BookOpen, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';
import { UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const { theme, lang, toggleTheme, setLanguage, t } = useAppTheme();

  const getMenu = () => {
    const role = user?.role || 'User';
    
    // Core features available to everyone
    const list = [
      { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { id: 'attendance', label: t('attendance'), icon: UserCheck },
      { id: 'duty_reports', label: t('dutyReports'), icon: ClipboardList },
      { id: 'leaves', label: t('leave'), icon: CalendarRange },
      { id: 'salaries', label: t('salaries'), icon: BadgeIndianRupee },
      { id: 'incidents', label: t('incidents'), icon: AlertTriangle },
      { id: 'visitors', label: t('visitors'), icon: Users },
      { id: 'sites', label: t('sites'), icon: MapPin },
      { id: 'documents', label: t('documents'), icon: FileLock },
      { id: 'training', label: t('training'), icon: BookOpen },
    ];

    // Administrative views
    if (role === 'Admin' || role === 'Super Admin' || role === 'Supervisor') {
      list.push({ id: 'admin_panel', label: t('admin'), icon: ShieldAlert });
    }

    if (role === 'Super Admin') {
      list.push({ id: 'super_admin_panel', label: t('superadmin'), icon: ShieldCheck });
    }

    list.push({ id: 'profile', label: t('settings'), icon: Settings });

    return list;
  };

  const handleLangToggle = () => {
    if (lang === 'en') setLanguage('hi');
    else if (lang === 'hi') setLanguage('or');
    else setLanguage('en');
  };

  const menuItems = getMenu();

  return (
    <aside id="app-sidebar" class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* App Branding */}
      <div class="p-6 flex items-center gap-3 border-b border-slate-800">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
          <ShieldAlert class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-sm font-bold uppercase tracking-widest text-white">SG Pro</h1>
          <p class="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">Security Force</p>
        </div>
      </div>

      {/* User Badge */}
      <div class="p-4 mx-3 my-4 bg-slate-800/30 border border-slate-800/80 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden shadow">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt={user.full_name} class="w-full h-full object-cover" />
            ) : (
              user?.full_name?.charAt(0) || 'G'
            )}
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-xs font-bold text-white truncate">{user?.full_name}</p>
            <p class="text-[10px] text-blue-405 uppercase font-medium truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-slate-850">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              class={`w-full flex items-center gap-3 px-3 py-2 rounded-md border text-left transition-all duration-150 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 font-medium' 
                  : 'text-slate-400 border-transparent hover:bg-slate-800'
              }`}
            >
              <IconComponent class={`w-4 h-4 ${isActive ? 'text-blue-405' : 'text-slate-400'}`} />
              <span class="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Panel Options */}
      <div class="p-4 border-t border-slate-850 space-y-3 bg-slate-950/45">
        {/* Languages & Theme Toggles */}
        <div class="flex items-center justify-between space-x-2">
          {/* Lang Selector */}
          <button 
            id="language-badge"
            title="Switch Language"
            onClick={handleLangToggle}
            class="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-white transition w-full justify-center"
          >
            <Languages class="w-3.5 h-3.5" />
            <span class="font-medium uppercase uppercase">{lang === 'en' ? 'EN' : lang === 'hi' ? 'HI' : 'OR'}</span>
          </button>

          {/* Theme Selector */}
          <button
            id="theme-toggle-button"
            onClick={toggleTheme}
            class="p-1.5 rounded-lg bg-slate-850 border border-slate-800 text-slate-350 hover:text-white transition"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun class="w-4 h-4 text-amber-400" /> : <Moon class="w-4 h-4 text-blue-400" />}
          </button>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          id="logout-sidebar-button"
          onClick={onLogout}
          class="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-550 text-rose-400 hover:bg-rose-500 hover:text-white text-sm font-medium transition duration-200"
        >
          <LogOut class="w-4 h-4" />
          <span>{t('logOut')}</span>
        </button>
      </div>
    </aside>
  );
};
