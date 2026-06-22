import { Injectable, NotFoundException } from '@nestjs/common';

export interface Skill {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
}

export interface InstalledSkill extends Skill {
  enabled: boolean;
  config: Record<string, unknown>;
}

const DEFAULT_SKILLS: Skill[] = [
  {
    slug: 'github',
    name: 'GitHub',
    description: 'Clone, read, and create pull requests on GitHub repos.',
    icon: 'github',
    category: 'Development Tools',
  },
  {
    slug: 'docker',
    name: 'Docker',
    description: 'Build and run containers from your project.',
    icon: 'docker',
    category: 'Development Tools',
  },
  {
    slug: 'browser',
    name: 'Browser',
    description: 'Open web pages and capture screenshots.',
    icon: 'browser',
    category: 'Browser',
  },
  {
    slug: 'database',
    name: 'Database',
    description: 'Inspect and query configured databases.',
    icon: 'database',
    category: 'Database',
  },
  {
    slug: 'linux-terminal',
    name: 'Linux Terminal',
    description: 'Run shell commands in a sandboxed terminal.',
    icon: 'terminal',
    category: 'Development Tools',
  },
  {
    slug: 'mcp',
    name: 'MCP',
    description: 'Connect to Model Context Protocol servers.',
    icon: 'mcp',
    category: 'MCP',
  },
  {
    slug: 'figma',
    name: 'Figma',
    description: 'Fetch designs and design tokens from Figma.',
    icon: 'figma',
    category: 'Design',
  },
  {
    slug: 'deploy',
    name: 'Deploy',
    description: 'Deploy builds to preview or production targets.',
    icon: 'deploy',
    category: 'Deploy',
  },
];

@Injectable()
export class SkillsService {
  private installed = new Map<string, Map<string, InstalledSkill>>();

  findAll(): Skill[] {
    return DEFAULT_SKILLS;
  }

  findInstalled(projectId: string): InstalledSkill[] {
    const map = this.installed.get(projectId);
    return map ? Array.from(map.values()) : [];
  }

  install(
    projectId: string,
    slug: string,
    config: Record<string, unknown> = {},
  ): InstalledSkill {
    const skill = DEFAULT_SKILLS.find((s) => s.slug === slug);
    if (!skill) {
      throw new NotFoundException(`Skill ${slug} not found`);
    }

    const projectSkills =
      this.installed.get(projectId) ?? new Map<string, InstalledSkill>();
    const existing = projectSkills.get(slug);
    const installed: InstalledSkill = {
      ...skill,
      enabled: true,
      config: { ...(existing?.config ?? {}), ...config },
    };
    projectSkills.set(slug, installed);
    this.installed.set(projectId, projectSkills);
    return installed;
  }

  toggle(projectId: string, slug: string, enabled: boolean): InstalledSkill {
    const projectSkills =
      this.installed.get(projectId) ?? new Map<string, InstalledSkill>();
    const existing = projectSkills.get(slug);
    if (!existing) {
      throw new NotFoundException(`Skill ${slug} is not installed`);
    }
    const updated = { ...existing, enabled };
    projectSkills.set(slug, updated);
    this.installed.set(projectId, projectSkills);
    return updated;
  }
}
