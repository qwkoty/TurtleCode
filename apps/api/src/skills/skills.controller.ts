import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SkillsService } from './skills.service';
import type { Skill, InstalledSkill } from './skills.service';

@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get('skills')
  findAll(): Skill[] {
    return this.skillsService.findAll();
  }

  @Get('projects/:id/skills')
  findInstalled(@Param('id') id: string): InstalledSkill[] {
    return this.skillsService.findInstalled(id);
  }

  @Post('projects/:id/skills/:slug')
  install(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Body() body: { config?: Record<string, unknown> },
  ): InstalledSkill {
    return this.skillsService.install(id, slug, body?.config);
  }

  @Post('projects/:id/skills/:slug/toggle')
  toggle(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Body() body: { enabled?: boolean },
  ): InstalledSkill {
    return this.skillsService.toggle(id, slug, body?.enabled ?? true);
  }
}
