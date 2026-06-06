/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PlusSquare, 
  MapPin, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  ExternalLink,
  ShieldAlert,
  Search,
  BookOpen
} from 'lucide-react';
import { IncidentRecord, UserProfile } from '../types';

interface IncidentsViewProps {
  user: UserProfile | null;
  incidentsList: IncidentRecord[];
  onAddIncident: (payload: {
    incident_type: string;
    incident_date: string;
    incident_time: string;
    location: string;
    description: string;
    witness_details: string;
    photo: string;
  }) => Promise<void>;
  onUpdateStatus: (id: number, status: 'Open' | 'In-Progress' | 'Resolved') => Promise<void>;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  user,
  incidentsList,
  onAddIncident,
  onUpdateStatus
}) => {
  const [incidentType, setIncidentType] = useState('Intrusion Attempt');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [witnessDetails, setWitnessDetails] = useState('');
  const [photoData, setPhotoData] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  // Parse images helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !description) {
      alert('Location and description fields details are mandatory');
      return;
    }
    setSubmitting(true);
    try {
      await onAddIncident({
        incident_type: incidentType,
        incident_date: incidentDate,
        incident_time: incidentTime,
        location,
        description,
        witness_details: witnessDetails,
        photo: photoData
      });
      setLocation('');
      setDescription('');
      setWitnessDetails('');
      setPhotoData('');
      alert('Emergency Incident Case #FILE created successfully! Roster supervisors have been dispatched.');
    } catch (err: any) {
      alert(err.message || 'File failure');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncidents = incidentsList.filter(inc => {
    const matchedSearch = 
      inc.incident_type.toLowerCase().includes(searchWord.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchWord.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchWord.toLowerCase());
      
    const matchedStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchedSearch && matchedStatus;
  });

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* File Emergency Case Card */}
      <div id="file-incident-card" class="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3 mb-4">
          <AlertTriangle class="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 class="font-bold text-sm text-white tracking-tight">Report Emergency Event</h2>
        </div>

        <form onSubmit={handleCreateSubmit} class="space-y-4">
          {/* Incident Type Selector */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Event Urgencies Category</label>
            <select
              id="incident-type-selector"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-red-500"
            >
              <option value="Intrusion Attempt">🚨 Intrusion Attempt / Direct Trespassing</option>
              <option value="Fire Emergency">🔥 Fire Safety Alarmed Hazards</option>
              <option value="Theft / Missing Property">📦 Theft / Logistics Discrepancy</option>
              <option value="Asset Damage Vandalism">🏗️ Critical Assets Site Damages</option>
              <option value="Medical Dispatch Emergency">🚑 Staff Medical Urgency</option>
              <option value="Other Safety Incident Log">⚠️ General Safety Breach Index</option>
            </select>
          </div>

          {/* Dates & Times */}
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Happened Date</label>
              <input
                id="incident-date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Time (hh:mm)</label>
              <input
                id="incident-time"
                type="text"
                placeholder="e.g. 14:35"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                required
                class="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Location / Station Hub Room</label>
            <input
              id="incident-location"
              type="text"
              placeholder="e.g. Sector 4 East Gate Gatehouse, Global Tech Block B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-red-500 placeholder-slate-700"
            />
          </div>

          {/* Description */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Breach Description / Actions Taken</label>
            <textarea
              id="incident-description"
              rows={4}
              placeholder="Details of what happened, sirens sound, dispatch actions, patrols mobilized..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-red-500 placeholder-slate-700 resize-none"
            />
          </div>

          {/* Witness Details */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Witness Details</label>
            <input
              id="incident-witnesses"
              type="text"
              placeholder="Witness personnel names and cell phones..."
              value={witnessDetails}
              onChange={(e) => setWitnessDetails(e.target.value)}
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none placeholder-slate-700"
            />
          </div>

          {/* Evidence Image Drop */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Evidence Attachment (.PNG/.JPG)</label>
            <div class="relative bg-slate-950 border border-dashed border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-red-500 transition duration-150">
              <input
                id="incident-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span class="text-[10px] text-slate-400 block truncate">
                {photoData ? '✓ Image loaded securely' : 'Drag or click to attach safety photo evidence'}
              </span>
            </div>
            {photoData && (
              <div class="mt-2 text-center">
                <img src={photoData} alt="evidence preview" class="max-h-24 inline-block rounded-lg shadow border border-slate-800" />
              </div>
            )}
          </div>

          <button
            id="submit-incident-button"
            type="submit"
            disabled={submitting}
            class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 focus:outline-none border border-red-500 transition shadow-md shadow-red-650/10"
          >
            {submitting ? 'Broadcasting Alert...' : '❗ MOBILIZE SECURITY REPORT'}
          </button>
        </form>
      </div>

      {/* Incidents logs tracker ledger */}
      <div id="incidents-tracker-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
          <div>
            <h2 class="font-bold text-sm text-white tracking-tight">Active Incident Registry Logs</h2>
            <p class="text-[10px] text-slate-500 font-mono">SQLite indexed disaster logs and Threat Indices</p>
          </div>

          {/* Filters controls */}
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-550 shrink-0 font-bold uppercase text-[10px] tracking-wider">Status:</span>
            <select
              id="incident-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              class="w-36 bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-xl p-2 focus:outline-none"
            >
              <option value="All">All Events</option>
              <option value="Open">🔴 Open / Unresolved</option>
              <option value="In-Progress">🟡 In-Progress</option>
              <option value="Resolved">🟢 Resolved / Handled</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div class="bg-slate-950 border border-slate-850 flex items-center px-3 py-2.5 rounded-xl">
          <Search class="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            id="incident-search-input"
            type="text"
            placeholder="Search details, site zones, witness lists..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            class="bg-transparent border-0 text-slate-200 text-xs focus:outline-none w-full placeholder-slate-650"
          />
        </div>

        {/* Incidents timeline lists scrolling */}
        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredIncidents.length === 0 ? (
            <div class="text-center py-12 text-xs text-slate-550 select-none">
              All Clear. No incident reports matched our active database search index.
            </div>
          ) : (
            filteredIncidents.map((inc) => (
              <div key={inc.id} class="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div class="space-y-3 flex-1 min-w-0">
                  <div class="flex items-center space-x-2.5">
                    <span class="px-2.5 py-1 text-[9px] bg-red-550/10 text-red-400 border border-red-500/15 rounded-md font-bold font-mono tracking-wider">
                      CASE #{inc.id}
                    </span>
                    <span class="text-xs text-slate-100 font-bold tracking-tight">
                      {inc.incident_type}
                    </span>
                    <span class={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[9px] font-bold ${
                      inc.status === 'Resolved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : inc.status === 'In-Progress'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-550/10 text-red-400 border border-red-500/20 animate-pulse'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    <div class="flex items-center space-x-1.5 text-slate-300">
                      <MapPin class="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span class="font-medium truncate max-w-xs">{inc.location}</span>
                    </div>
                    <div class="flex items-center space-x-1.5 text-slate-500 font-mono">
                      <Clock class="w-3.5 h-3.5 text-slate-650 shrink-0" />
                      <span>{inc.incident_date} {inc.incident_time}</span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-400 leading-relaxed max-w-2xl">{inc.description}</p>
                  
                  {inc.witness_details && (
                    <div class="p-2.5 bg-slate-1000 border border-slate-900 rounded-xl">
                      <span class="text-[9px] text-slate-500 font-bold uppercase block">witness statements:</span>
                      <p class="text-xs text-slate-350 italic mt-0.5 font-sans font-medium">{inc.witness_details}</p>
                    </div>
                  )}
                </div>

                <div class="flex flex-col sm:flex-row md:flex-col items-center justify-end gap-3 shrink-0">
                  {/* Photo attachment representation if present */}
                  {inc.photo && (
                    <img 
                      src={inc.photo} 
                      alt="attachment preview" 
                      class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-slate-800 bg-slate-900" 
                    />
                  )}

                  {/* Status updates for admin users */}
                  {(user?.role === 'Admin' || user?.role === 'Super Admin' || user?.role === 'Supervisor') && (
                    <div class="flex items-center space-x-1">
                      {inc.status !== 'In-Progress' && inc.status !== 'Resolved' && (
                        <button
                          id={`incident-progress-btn-${inc.id}`}
                          onClick={() => onUpdateStatus(inc.id, 'In-Progress')}
                          class="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-amber-400 rounded text-[9px] font-bold border border-slate-800"
                        >
                          Mobilize (In-Progress)
                        </button>
                      )}
                      {inc.status !== 'Resolved' && (
                        <button
                          id={`incident-resolve-btn-${inc.id}`}
                          onClick={() => onUpdateStatus(inc.id, 'Resolved')}
                          class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold"
                        >
                          Resolve Case
                        </button>
                      )}
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
