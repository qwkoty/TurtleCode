import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  SkillsService,
  SkillMarketItem,
  InstalledSkill,
} from './skills.service';

@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('skills/market')
  findMarket(): SkillMarketItem[] {
    return this.skillsService.findMarket();
  }

  @Get('projects/:id/skills')
  async findInstalled(@Param('id') id: string): Promise<InstalledSkill[]> {
    return this.skillsService.findInstalled(id);
  }

  @Post('projects/:id/skills/:slug/install')
  async install(
    @Param('id') id: string,
    @Param('slug') slug: string,
  ): Promise<InstalledSkill | null> {
    return this.skillsService.install(id, slug);
  }

  @Delete('projects/:id/skills/:slug')
  async uninstall(
    @Param('id') id: string,
    @Param('slug') slug: string,
  ): Promise<InstalledSkill | null> {
    return this.skillsService.uninstall(id, slug);
  }

  @Post('projects/:id/skills/:slug/toggle')
  async toggle(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Body() body: { enabled?: boolean },
  ): Promise<InstalledSkill | null> {
    return this.skillsService.toggleEnabled(id, slug, body?.enabled ?? true);
  }
}
