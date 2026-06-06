/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'User' | 'Security Guard' | 'Supervisor' | 'Admin' | 'Super Admin';

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  employee_id: string;
  mobile_number: string;
  address: string;
  joining_date: string;
  department: string;
  designation: string;
  profile_photo: string;
  is_active: number;
  is_banned: number;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  full_name?: string;
  employee_id?: string;
  mobile_number?: string;
  date: string;
  site_name: string;
  shift: 'Day Shift' | 'Night Shift';
  reporting_time: string;
  remarks: string;
  verified: number;
  verified_by?: string;
}

export interface DutyReport {
  id: number;
  site_name: string;
  guard_id: number;
  guard_name?: string;
  shift_time: string;
  duty_status: string;
  incident_details: string;
  remarks: string;
  date_time: string;
}

export interface IncidentRecord {
  id: number;
  incident_type: string;
  incident_date: string;
  incident_time: string;
  location: string;
  description: string;
  witness_details: string;
  photo?: string;
  status: 'Open' | 'In-Progress' | 'Resolved';
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  employee_name?: string;
  employee_id?: string;
  reason: string;
  start_date: string;
  end_date: string;
  emergency_contact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

export interface VisitorRecord {
  id: number;
  visitor_name: string;
  mobile_number: string;
  purpose: string;
  person_to_meet: string;
  entry_time: string;
  exit_time: string;
  visitor_photo?: string;
  site_name: string;
}

export interface SiteRecord {
  id: number;
  site_name: string;
  site_address: string;
  site_manager: string;
  contact_number: string;
}

export interface DocumentRecord {
  id: number;
  user_id: number;
  employee_name?: string;
  title: string;
  type: 'License' | 'ID Card' | 'Certificate' | 'Other';
  file_data: string; // Base64
  uploaded_at: string;
}

export interface SystemNotification {
  id: number;
  user_id: number; // 0 for everyone/all users
  title: string;
  message: string;
  type: 'attendance' | 'leave' | 'salary' | 'incident' | 'reminder' | 'announcement';
  is_read: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface LoginLog {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  ip_address: string;
  device_name: string;
  login_time: string;
  browser: string;
}
