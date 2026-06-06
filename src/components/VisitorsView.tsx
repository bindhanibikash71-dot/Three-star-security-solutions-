/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Clock, 
  Search, 
  LogOut, 
  ShieldCheck, 
  Camera,
  SearchCode
} from 'lucide-react';
import { SiteRecord, UserProfile, VisitorRecord } from '../types';

interface VisitorsViewProps {
  user: UserProfile | null;
  visitorsList: VisitorRecord[];
  sites: SiteRecord[];
  onAddVisitor: (payload: {
    visitor_name: string;
    mobile_number: string;
    purpose: string;
    person_to_meet: string;
    site_name: string;
    visitor_photo: string;
  }) => Promise<void>;
  onCheckoutVisitor: (id: number) => Promise<void>;
}

export const VisitorsView: React.FC<VisitorsViewProps> = ({
  user,
  visitorsList,
  sites,
  onAddVisitor,
  onCheckoutVisitor
}) => {
  const [visitorName, setVisitorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [purpose, setPurpose] = useState('Official Business Meetings');
  const [personToMeet, setPersonToMeet] = useState('');
  const [siteName, setSiteName] = useState('');
  const [visitorPhoto, setVisitorPhoto] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Parse custom photo capture mockup (base64 dummy file)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setVisitorPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      alert('Active Deployment site checkpoint is required');
      return;
    }
    setSubmitting(true);
    try {
      await onAddVisitor({
        visitor_name: visitorName,
        mobile_number: mobileNumber,
        purpose,
        person_to_meet: personToMeet,
        site_name: siteName,
        visitor_photo: visitorPhoto
      });
      setVisitorName('');
      setMobileNumber('');
      setPersonToMeet('');
      setVisitorPhoto('');
      alert('Visitor checked in successfully! Gate Pass ID recorded on SQLite.');
    } catch (err: any) {
      alert(err.message || 'Checkin failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = visitorsList.filter(v => 
    v.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile_number.includes(search) ||
    v.person_to_meet.toLowerCase().includes(search.toLowerCase()) ||
    v.site_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Front gate Visitor checkpoint checklist entry Form */}
      <div id="visitor-checkin-panel" class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
          <UserPlus class="w-5 h-5 text-blue-450" />
          <h2 class="font-bold text-sm text-white tracking-tight">Active Gate-Pass Registration</h2>
        </div>

        <form onSubmit={handleVisitorSubmit} class="space-y-4">
          {/* Visitor Name */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Visitor Full Name</label>
            <input
              id="visitor-name"
              type="text"
              placeholder="e.g. Anand Kumar Rao"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-700"
            />
          </div>

          {/* Contact cell */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Primary Contact Cell</label>
            <input
              id="visitor-phone"
              type="tel"
              placeholder="+91 95400-XXXXX"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-700"
            />
          </div>

          {/* Purpose options */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Access Purpose</label>
            <select
              id="visitor-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            >
              <option value="Official Business Meetings">Official Business Meetings</option>
              <option value="Maintenance & Hazards services">Transit Maintenance / Vendor Services</option>
              <option value="Client Visit / Site Inspection">Client Inspection Visit</option>
              <option value="Personal Visit to Employee">Personal Visit / Friends</option>
              <option value="Delivery courier dropoff">Logistics / Delivery Dropoffs</option>
            </select>
          </div>

          {/* Person to meet */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Person to Meet / Contact</label>
            <input
              id="visitor-host"
              type="text"
              placeholder="e.g. Mr. S. Mohapatra (VP Quality)"
              value={personToMeet}
              onChange={(e) => setPersonToMeet(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-700"
            />
          </div>

          {/* Deployment Station Checkpoint location */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Checkpoint Entrance Post</label>
            <select
              id="visitor-site-choice"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Access Entrance Lobby --</option>
              {sites.map(s => (
                <option key={s.id} value={s.site_name}>{s.site_name}</option>
              ))}
            </select>
          </div>

          {/* Photo Capture mock */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Capture ID Photo (Mock Scanner)</label>
            <div class="relative bg-slate-950 border border-dashed border-slate-800 rounded-xl p-3.5 text-center hover:border-blue-500 cursor-pointer transition">
              <input
                id="visitor-photo-select"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div class="flex flex-col items-center justify-center text-slate-400">
                <Camera class="w-5 h-5 text-blue-400 mb-1" />
                <span class="text-[9px] truncate max-w-full">
                  {visitorPhoto ? '✓ Guest image recorded' : 'Record face-id (click / load image)'}
                </span>
              </div>
            </div>
          </div>

          <button
            id="register-visitor-button"
            type="submit"
            disabled={submitting}
            class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 focus:outline-none border border-blue-500/20 shadow-md transition"
          >
            {submitting ? 'Registering Guest Entry...' : 'VALIDATE & REGISTER ACCESS'}
          </button>
        </form>
      </div>

      {/* Visitors listing logs ledger */}
      <div id="visitors-ledger-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-sm text-white tracking-tight">Access Gate Roster logs</h2>
          <p class="text-[10px] text-slate-500 font-mono">Real-time gate pass audits</p>
        </div>

        {/* Search */}
        <div class="bg-slate-950 border border-slate-850 flex items-center px-3 py-2.5 rounded-xl">
          <Search class="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            id="visitor-search-input"
            type="text"
            placeholder="Search visitor logs, hosting staff, entrance points..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            class="bg-transparent border-0 text-slate-200 text-xs focus:outline-none w-full placeholder-slate-700"
          />
        </div>

        {/* Visitor grid List */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div class="md:col-span-2 text-center py-12 text-xs text-slate-505 select-none">
              All Clear. No guests currently registered on this gatepost index.
            </div>
          ) : (
            filtered.map((v) => (
              <div key={v.id} class="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start space-x-3 relative overflow-hidden group">
                {/* Visual Accent for checked-out vs active guests */}
                <div class={`absolute top-0 left-0 w-1 h-full ${v.exit_time ? 'bg-slate-800' : 'bg-emerald-500'}`}></div>

                {/* Photo or placeholder */}
                <div class="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-white shrink-0 font-bold overflow-hidden select-none shadow">
                  {v.visitor_photo ? (
                    <img src={v.visitor_photo} alt={v.visitor_name} class="w-full h-full object-cover" />
                  ) : (
                    v.visitor_name.charAt(0)
                  )}
                </div>

                {/* Details */}
                <div class="flex-1 min-w-0 text-xs space-y-1">
                  <span class="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 block">ID PASS: #G-{v.id}</span>
                  <p class="font-bold text-slate-200 truncate leading-tight">{v.visitor_name}</p>
                  <p class="text-[10px] text-slate-400 font-medium">{v.mobile_number}</p>
                  
                  <div class="text-[10px] text-slate-500 font-mono space-y-0.5">
                    <div><span class="text-slate-600">Post Host:</span> <span class="text-slate-350">{v.person_to_meet}</span></div>
                    <div><span class="text-slate-600">Location:</span> <span class="text-blue-400 truncate">{v.site_name}</span></div>
                  </div>

                  <p class="text-[10px] text-slate-405 italic bg-slate-950 px-2 py-1 rounded inline-block select-text border border-slate-850 max-w-full">
                    "{v.purpose}"
                  </p>

                  <div class="pt-2 border-t border-slate-900 text-[10px] space-y-0.5 mt-2">
                    <div class="flex items-center text-slate-450"><Clock class="w-3 h-3 text-slate-600 mr-1.5" /> Entry: <span class="font-mono text-slate-350 ml-1">{v.entry_time}</span></div>
                    {v.exit_time ? (
                      <div class="flex items-center text-slate-500"><LogOut class="w-3 h-3 text-rose-550 mr-1.5 shrink-0" /> Checked Out: <span class="font-mono ml-1">{v.exit_time}</span></div>
                    ) : (
                      <div class="flex items-center text-emerald-400 font-bold animate-pulse"><ShieldCheck class="w-3 h-3 text-emerald-500 mr-1.5" /> Checked In Gate Active</div>
                    )}
                  </div>
                </div>

                {/* Exit action triggers */}
                {!v.exit_time && (
                  <button
                    id={`visitor-checkout-btn-${v.id}`}
                    onClick={() => {
                      if (confirm(`Check out guest ${v.visitor_name} at this moment?`)) {
                        onCheckoutVisitor(v.id);
                      }
                    }}
                    class="p-2 bg-slate-850 hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition self-start shrink-0 border border-slate-800"
                    title="Log Visitor Exit Clearance"
                  >
                    <LogOut class="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
