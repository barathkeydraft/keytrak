import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { Role, TimeLogType } from '@prisma/client';

export const getEmployeeWorkStatus = async (req: Request, res: Response) => {
  try {
    const currentTime = new Date();
    const startOfDay = new Date(currentTime.setHours(0, 0, 0, 0));

    const employees = await prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      select: {
        id: true,
        name: true,
        email: true,
        timeLogs: {
          where: {
            startTime: { gte: startOfDay },
            endTime: null,
            type: TimeLogType.WORK
          }
        },
        attendance: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const employeeStatus = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      isActive: emp.timeLogs.length > 0,
      lastAttendance: emp.attendance[0]
    }));

    res.json(employeeStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee work status' });
  }
};

export const getProductivityMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate as string) : new Date(new Date().setHours(23, 59, 59, 999));

    const employees = await prisma.user.findMany({
      where: { role: Role.EMPLOYEE },
      select: {
        id: true,
        name: true,
        timeLogs: {
          where: {
            startTime: { gte: start },
            endTime: { lte: end },
            type: TimeLogType.WORK
          }
        },
        tasks: {
          where: {
            status: 'COMPLETE',
            updatedAt: { gte: start, lte: end }
          }
        }
      }
    });

    const metrics = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      hoursWorked: emp.timeLogs.reduce((acc, log) => {
        if (log.endTime) {
          return acc + (log.endTime.getTime() - log.startTime.getTime()) / (1000 * 60 * 60);
        }
        return acc;
      }, 0),
      tasksCompleted: emp.tasks.length
    }));

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch productivity metrics' });
  }
};

export const getEmployeeTimeLogs = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate as string) : new Date(new Date().setHours(23, 59, 59, 999));

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: employeeId as string,
        startTime: { gte: start },
        endTime: { lte: end }
      },
      include: {
        task: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    res.json(timeLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee time logs' });
  }
}; 