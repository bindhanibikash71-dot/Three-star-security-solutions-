/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  PlusSquare, 
  User, 
  Phone, 
  Trash2, 
  Building2,
  ShieldCheck,
  LocateFixed
} from 'lucide-react';
import { SiteRecord, UserProfile } from '../types';

interface SitesViewProps {
  user: UserProfile | null;
  sitesList: SiteRecord[];
  onAddSite: (payload: { site_name: string; site_address: string; site_manager: string; contact_number: string }) => Promise<void>;
  onDeleteSite: (id: number) => Promise<void>;
}

export const SitesView: React.FC<SitesViewProps> = ({ user, sitesList, onAddSite, onDeleteSite }) => {
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteManager, setSiteManager] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !siteAddress) {
      alert('Site Name and Site address description are mandatory');
      return;
    }
    setSubmitting(true);
    try {
      await onAddSite({ site_name: siteName, site_address: siteAddress, site_manager: siteManager, contact_number: contactNumber });
      setSiteName('');
      setSiteAddress('');
      setSiteManager('');
      setContactNumber('');
      alert('Security Station Post added successfully to database.');
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Create station post */}
      <div id="add-site-panel" class="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3 mb-4">
          <PlusSquare class="w-5 h-5 text-blue-400" />
          <h2 class="font-bold text-sm text-white tracking-tight">Add Security Station Post</h2>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Super Admin') ? (
          <form onSubmit={handleSubmit} class="space-y-4">
            {/* Site Name */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Station Post Name</label>
              <input
                id="site-name-input"
                type="text"
                placeholder="e.g. Oracle Towers Block 5"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-750"
              />
            </div>

            {/* Address */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Site Physical Address</label>
              <input
                id="site-address-input"
                type="text"
                placeholder="e.g. Infocity Sector 9, Patia"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-750"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Site Supervisor / Manager</label>
              <input
                id="site-manager-input"
                type="text"
                placeholder="Manager name..."
                value={siteManager}
                onChange={(e) => setSiteManager(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-505 placeholder-slate-750"
              />
            </div>

            {/* Manager Contact */}
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Supervisor Phone Contact</label>
              <input
                id="site-phone-input"
                type="text"
                placeholder="+91 91000-XXXXX"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-755"
              />
            </div>

            <button
              id="submit-site-button"
              type="submit"
              disabled={submitting}
              class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 focus:outline-none border border-blue-500/20 shadow-md transition"
            >
              {submitting ? 'Registering Station...' : 'Add Station Post'}
            </button>
          </form>
        ) : (
          <div class="text-xs text-slate-500 py-6 text-center select-none leading-relaxed">
            ❗ Access restricted. Only Operational Managers or Admins possess permissions to establish new stations.
          </div>
        )}
      </div>

      {/* Station Posts listing */}
      <div id="sites-ledger-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-sm text-white tracking-tight">Active Duty Patrol Sites</h2>
          <p class="text-[10px] text-slate-500 font-mono">SQLite managed station zones list</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
          {sitesList.length === 0 ? (
            <div class="md:col-span-2 text-center py-12 text-xs text-slate-505 select-none">
              No registered site checkpoints. Deployments are inactive.
            </div>
          ) : (
            sitesList.map((site) => (
              <div key={site.id} class="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3.5 hover:border-slate-800 transition duration-150 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>

                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center space-x-2.5">
                    <div class="p-2 bg-blue-505/10 border border-blue-505/20 text-blue-400 rounded-lg shrink-0">
                      <Building2 class="w-4 h-4" />
                    </div>
                    <div>
                      <h3 class="font-bold text-slate-205 text-sm leading-tight">{site.site_name}</h3>
                      <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 mt-0.5 block">POST ID: #STN-{site.id}</span>
                    </div>
                  </div>

                  {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                    <button
                      id={`delete-site-btn-${site.id}`}
                      onClick={() => {
                        if (confirm(`Remove station post ${site.site_name} from active systems database?`)) {
                          onDeleteSite(site.id);
                        }
                      }}
                      class="p-1 px-2 bg-rose-500/10 border border-rose-550/15 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-xs transition shrink-0"
                      title="Clear station"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* address */}
                <div class="flex items-start space-x-2 text-xs text-slate-400 pb-2.5 border-b border-slate-900">
                  <MapPin class="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span class="leading-relaxed">{site.site_address}</span>
                </div>

                {/* manager details */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div class="flex items-center space-x-1.5 font-medium">
                    <User class="w-3.5 h-3.5 text-slate-650 shrink-0" />
                    <span class="truncate text-slate-350">{site.site_manager || 'Vacant Supervisor'}</span>
                  </div>
                  {site.contact_number && (
                    <div class="flex items-center space-x-1.5 font-mono">
                      <Phone class="w-3.5 h-3.5 text-slate-650 shrink-0" />
                      <span>{site.contact_number}</span>
                    </div>
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
