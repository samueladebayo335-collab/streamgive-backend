import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path as needed

@Injectable()
export class ImpactService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformImpact() {
    // Use SQL aggregation instead of loading all streams into memory
    const result = await this.prisma.$queryRaw<{ totalAmount: number; totalStreams: number }[]>`
      SELECT 
        COALESCE(SUM(amount), 0) as "totalAmount",
        COUNT(id) as "totalStreams"
      FROM "Stream";
    `;

    return {
      totalAmount: Number(result[0]?.totalAmount || 0),
      totalStreams: Number(result[0]?.totalStreams || 0),
    };
  }

  async getNgoImpact(ngoId: string) {
    // Aggregate platform total and NGO-specific total in SQL
    const [platformResult, ngoResult] = await Promise.all([
      this.prisma.$queryRaw<{ totalAmount: number }[]>`
        SELECT COALESCE(SUM(amount), 0) as "totalAmount" FROM "Stream";
      `,
      this.prisma.$queryRaw<{ totalAmount: number; totalStreams: number }[]>`
        SELECT 
          COALESCE(SUM(amount), 0) as "totalAmount",
          COUNT(id) as "totalStreams"
        FROM "Stream"
        WHERE "ngoId" = ${ngoId};
      `,
    ]);

    return {
      ngoId,
      ngoTotalAmount: Number(ngoResult[0]?.totalAmount || 0),
      ngoTotalStreams: Number(ngoResult[0]?.totalStreams || 0),
      platformTotalAmount: Number(platformResult[0]?.totalAmount || 0),
    };
  }
}