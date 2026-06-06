/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  FolderLock, 
  FileCode, 
  BookMarked,
  Clock,
  UserCheck
} from 'lucide-react';
import { DocumentRecord, UserProfile } from '../types';

interface DocumentsViewProps {
  user: UserProfile | null;
  documentsList: DocumentRecord[];
  onUploadDocument: (payload: { title: string; type: 'License' | 'ID Card' | 'Certificate' | 'Other'; file_data: string }) => Promise<void>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ user, documentsList, onUploadDocument }) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<'License' | 'ID Card' | 'Certificate' | 'Other'>('License');
  const [fileData, setFileData] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Document size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileData) {
      alert('Specify a title name and drag a document file to upload');
      return;
    }

    setUploading(true);
    try {
      await onUploadDocument({ title, type: docType, file_data: fileData });
      setTitle('');
      setFileData('');
      alert('Document secure upload registered successfully in database.');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Safe file downloader helper
  const triggerDownload = (doc: DocumentRecord) => {
    const link = document.createElement('a');
    link.href = doc.file_data;
    link.download = `${doc.type}_${doc.title.replace(/\s+/g, '_')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter lists based on ownership
  const displayedDocs = documentsList;

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Upload File Panel form */}
      <div class="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-850 pb-3 mb-4">
          <Upload class="w-5 h-5 text-blue-400" />
          <h2 class="font-bold text-sm text-white tracking-tight">Upload Credentials Index</h2>
        </div>

        <form onSubmit={handleUploadSubmit} class="space-y-4">
          {/* Title */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Document Title Name</label>
            <input
              id="doc-title-input"
              type="text"
              placeholder="e.g. Armed Gun License 2026, Employee ID Card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder-slate-755"
            />
          </div>

          {/* Doc Type */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Credential Category</label>
            <select
              id="doc-type-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              required
              class="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            >
              <option value="License">🪪 Government Arms / Security License</option>
              <option value="ID Card">💳 Personal National ID Card / Aadhaar</option>
              <option value="Certificate">📜 Training Merit Credentials Certificate</option>
              <option value="Other">📂 Other Verification Indexes</option>
            </select>
          </div>

          {/* File input */}
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1 uppercase font-mono">Attachment File (.pdf, .png, .jpg)</label>
            <div class="relative bg-slate-950 border border-dashed border-slate-800 rounded-xl p-5 text-center hover:border-blue-500 cursor-pointer transition">
              <input
                id="doc-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div class="flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
                <FolderLock class="w-5 h-5 text-blue-400" />
                <span class="text-[9px] truncate max-w-full">
                  {fileData ? '📋 Document loaded successfully' : 'Drag file or click to load'}
                </span>
              </div>
            </div>
          </div>

          <button
            id="register-document-button"
            type="submit"
            disabled={uploading}
            class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 focus:outline-none border border-blue-500/20 shadow-md transition"
          >
            {uploading ? 'Storing File...' : 'Secure Document upload'}
          </button>
        </form>
      </div>

      {/* Corporate Locker Documents view list */}
      <div id="credential-locker-block" class="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-sm text-white tracking-tight">Digital Locker Vault</h2>
          <p class="text-[10px] text-slate-500 font-mono">Confidential cloud-based system-level document ledger</p>
        </div>

        {/* Catalog grid */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 select-none">
          {displayedDocs.length === 0 ? (
            <div class="sm:col-span-2 text-center py-12 text-slate-505 text-xs select-none">
              Your Digital Document locker drawer is empty. Upload credential logs to verify.
            </div>
          ) : (
            displayedDocs.map((doc) => (
              <div key={doc.id} class="p-3.5 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-2xl flex items-start justify-between gap-3 transition">
                <div class="flex items-start space-x-3 min-w-0">
                  <div class="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-blue-400 font-mono text-center shrink-0">
                    <FileText class="w-5 h-5" />
                    <span class="text-[7px] uppercase font-bold tracking-wider mt-1 block opacity-80">{doc.type}</span>
                  </div>

                  <div class="space-y-1 min-w-0">
                    <h3 class="font-bold text-slate-200 text-xs truncate max-w-[200px]" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p class="text-[9px] text-slate-505 font-mono max-w-xs">{doc.uploaded_at} Uploaded</p>
                    <div class="flex items-center space-x-1.5 text-[10px] text-slate-500 pt-1">
                      <UserCheck class="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span class="truncate">Owner: {doc.employee_name || 'My self'}</span>
                    </div>
                  </div>
                </div>

                <button
                  id={`download-doc-btn-${doc.id}`}
                  onClick={() => triggerDownload(doc)}
                  class="p-2 bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition shrink-0"
                  title="Download secure Base64 replica"
                >
                  <Download class="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
