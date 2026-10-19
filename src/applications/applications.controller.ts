import { Controller, Post, Body, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
// Import your application service and notification service

@Controller('applications')
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(
    private readonly applicationsService: any,
    private readonly notificationService: any
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() createDto: any) {
    // 1. Commit application creation
    const application = await this.applicationsService.create(createDto);

    // 2. Trigger notification with non-blocking error catching
    try {
      await this.notificationService.notify({
        type: 'application_created',
        targetId: application.id,
      });
    } catch (error) {
      this.logger.error(`Failed to record notification log for application ${application.id}: ${error.message}`, error.stack);
    }

    return application;
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  async reviewApplication(@Param('id') id: string, @Body() reviewDto: any) {
    // 1. Commit application review update
    const updatedApplication = await this.applicationsService.review(id, reviewDto);

    // 2. Trigger notification with non-blocking error catching
    try {
      await this.notificationService.notify({
        type: 'application_reviewed',
        targetId: updatedApplication.id,
      });
    } catch (error) {
      this.logger.error(`Failed to record notification log for application review ${updatedApplication.id}: ${error.message}`, error.stack);
    }

    return updatedApplication;
  }
}