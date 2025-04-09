import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateAttendanceDTO {
  type: 'LOGIN' | 'LOGOUT';
  latitude: number;
  longitude: number;
  locationName?: string;
  userId: string;
}

interface GetAttendanceHistoryParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export const attendanceService = {
  async createAttendance(data: CreateAttendanceDTO) {
    return prisma.attendance.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async getAttendanceHistory({ userId, startDate, endDate }: GetAttendanceHistoryParams) {
    return prisma.attendance.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async getLatestAttendance(userId: string) {
    return prisma.attendance.findFirst({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  },
}; 