import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { PrismaClient, Task, TimeLog, User } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get daily summary report for an employee
router.get('/daily-summary/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;
    
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: employeeId,
        createdAt: {
          gte: date ? new Date(date as string) : new Date(new Date().setHours(0, 0, 0, 0)),
          lte: date ? new Date(new Date(date as string).setHours(23, 59, 59, 999)) : new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        task: true,
        user: true,
      },
    });

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: employeeId,
        status: 'COMPLETE',
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    const totalWorkHours = timeLogs.reduce((acc: number, log: TimeLog & { task: Task | null; user: User }) => {
      if (log.type === 'WORK' && log.endTime) {
        const duration = (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 60 * 60);
        return acc + duration;
      }
      return acc;
    }, 0);

    res.json({
      date: new Date().toISOString(),
      totalWorkHours,
      tasksCompleted: tasks.map((task: Task) => ({
        id: task.id,
        name: task.name,
        status: task.status,
        updatedAt: task.updatedAt.toISOString(),
      })),
      notes: timeLogs.filter(log => log.notes).map(log => log.notes).join('\n'),
      employeeId,
      employeeName: timeLogs[0]?.user.name || '',
    });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    res.status(500).json({ error: 'Failed to generate daily summary' });
  }
});

// Get work hours report
router.get('/work-hours', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        ...(employeeId && { userId: employeeId as string }),
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      include: {
        user: true,
      },
    });

    const report = timeLogs.reduce((acc: Record<string, any>, log: TimeLog & { user: User }) => {
      const date = log.createdAt.toISOString().split('T')[0];
      const key = `${log.userId}-${date}`;
      
      if (!acc[key]) {
        acc[key] = {
          employeeId: log.userId,
          employeeName: log.user.name,
          date,
          totalHours: 0,
          breakTime: 0,
        };
      }

      if (log.endTime) {
        const duration = (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 60 * 60);
        if (log.type === 'BREAK') {
          acc[key].breakTime += duration;
        } else {
          acc[key].totalHours += duration;
        }
      }

      return acc;
    }, {});

    res.json(Object.values(report));
  } catch (error) {
    console.error('Error generating work hours report:', error);
    res.status(500).json({ error: 'Failed to generate work hours report' });
  }
});

// Get tasks report
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: date ? new Date(date as string) : new Date(new Date().setHours(0, 0, 0, 0)),
          lte: date ? new Date(new Date(date as string).setHours(23, 59, 59, 999)) : new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: {
        assignee: true,
      },
    });

    const report = {
      date: date ? new Date(date as string).toISOString() : new Date().toISOString(),
      tasks: tasks.map((task: Task & { assignee: User | null }) => ({
        id: task.id,
        name: task.name,
        status: task.status,
        assignedTo: task.assignee?.name || 'Unassigned',
        updatedAt: task.updatedAt.toISOString(),
      })),
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating tasks report:', error);
    res.status(500).json({ error: 'Failed to generate tasks report' });
  }
});

export default router; 