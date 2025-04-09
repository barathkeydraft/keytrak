import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export interface AttendanceLog {
  id: string;
  type: 'LOGIN' | 'LOGOUT';
  timestamp: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface CreateAttendanceDTO {
  type: 'LOGIN' | 'LOGOUT';
  latitude: number;
  longitude: number;
  locationName?: string;
}

const attendanceService = {
  async markAttendance(data: CreateAttendanceDTO): Promise<AttendanceLog> {
    const response = await axios.post(`${API_BASE_URL}/attendance`, data);
    return response.data;
  },

  async getAttendanceHistory(startDate?: Date, endDate?: Date): Promise<AttendanceLog[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await axios.get(`${API_BASE_URL}/attendance/history`, { params });
    return response.data;
  },

  async getLatestAttendance(): Promise<AttendanceLog | null> {
    const response = await axios.get(`${API_BASE_URL}/attendance/latest`);
    return response.data;
  },
};

export default attendanceService; 