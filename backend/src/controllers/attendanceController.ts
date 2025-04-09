import { Request, Response } from 'express';
import { attendanceService } from '../services/attendanceService';
import { AuthRequest } from '../middleware/auth';

export const attendanceController = {
  async markAttendance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { type, latitude, longitude, locationName } = req.body;

      const attendance = await attendanceService.createAttendance({
        type,
        latitude,
        longitude,
        locationName,
        userId,
      });

      res.status(201).json(attendance);
    } catch (error) {
      console.error('Error marking attendance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getAttendanceHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;

      const history = await attendanceService.getAttendanceHistory({
        userId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(history);
    } catch (error) {
      console.error('Error getting attendance history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async getLatestAttendance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const attendance = await attendanceService.getLatestAttendance(userId);
      res.json(attendance);
    } catch (error) {
      console.error('Error getting latest attendance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
}; 