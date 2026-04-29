import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../users/auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string | null;
  };
}

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getDashboard(req.user._id);
  }
}
