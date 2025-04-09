import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startTimeLog = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        startTime: new Date(),
        type: req.body.type || 'WORK',
        userId,
        taskId: req.body.taskId, // Optional task ID
      },
    });

    res.status(201).json(timeLog);
  } catch (error) {
    console.error('Error starting time log:', error);
    res.status(500).json({ error: 'Failed to start time log' });
  }
};

export const stopTimeLog = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the most recent active time log for this user
    const activeTimeLog = await prisma.timeLog.findFirst({
      where: {
        userId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    if (!activeTimeLog) {
      return res.status(404).json({ error: 'No active time log found' });
    }

    // Update the time log with the end time
    const updatedTimeLog = await prisma.timeLog.update({
      where: {
        id: activeTimeLog.id,
      },
      data: {
        endTime: new Date(),
      },
    });

    res.json(updatedTimeLog);
  } catch (error) {
    console.error('Error stopping time log:', error);
    res.status(500).json({ error: 'Failed to stop time log' });
  }
};

export const getCurrentTimeLog = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const activeTimeLog = await prisma.timeLog.findFirst({
      where: {
        userId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        task: true,
      },
    });

    res.json(activeTimeLog);
  } catch (error) {
    console.error('Error fetching current time log:', error);
    res.status(500).json({ error: 'Failed to fetch current time log' });
  }
};

export const getDailyLogs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await prisma.timeLog.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        task: true,
      },
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    res.status(500).json({ error: 'Failed to fetch daily logs' });
  }
};

export const updateTimeLogNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { timeLogId } = req.params;
    const { notes } = req.body;

    // Verify the time log belongs to the user
    const timeLog = await prisma.timeLog.findFirst({
      where: {
        id: timeLogId,
        userId,
      },
    });

    if (!timeLog) {
      return res.status(404).json({ error: 'Time log not found' });
    }

    // Update the notes
    const updatedTimeLog = await prisma.timeLog.update({
      where: {
        id: timeLogId,
      },
      data: {
        notes,
      },
    });

    res.json(updatedTimeLog);
  } catch (error) {
    console.error('Error updating time log notes:', error);
    res.status(500).json({ error: 'Failed to update time log notes' });
  }
}; 