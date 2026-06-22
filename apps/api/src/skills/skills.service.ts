import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as rawMarket from './market.json';

const execAsync = promisify(exec);

export interface SkillMarketItem {
  slug: string;
  name: string;
  description: string;
  package: string;
  icon: string;
  configSchema?: Array<{ key: string; label: string; type: string }>;
}

export interface InstalledSkill {
  slug: string;
  name: string;
  description: string;
  package: string;
  icon: string;
  enabled: boolean;
  status: 'not-installed' | 'installing' | 'installed' | 'error';
  error?: string;
}

const market = rawMarket as SkillMarketItem[];

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);
  private readonly skillsRoot: string;
  private readonly stateFile: string;
  private installStatus = new Map<
    string,
    'installing' | 'installed' | 'error'
  >();
  private installError = new Map<string, string>();

  constructor() {
    this.skillsRoot = path.resolve(process.cwd(), 'skills');
    this.stateFile = path.join(this.skillsRoot, 'state.json');
    void this.ensureDirs();
  }

  findMarket(): SkillMarketItem[] {
    return market;
  }

  async findInstalled(projectId: string): Promise<InstalledSkill[]> {
    const enabled = await this.readEnabled(projectId);
    return Promise.all(
      market.map(async (item) => {
        const status =
          this.installStatus.get(item.slug) ??
          (await this.detectStatus(item.slug));
        return {
          ...item,
          enabled: enabled.includes(item.slug),
          status: status,
          error: this.installError.get(item.slug),
        };
      }),
    );
  }

  async install(
    projectId: string,
    slug: string,
  ): Promise<InstalledSkill | null> {
    const item = market.find((s) => s.slug === slug);
    if (!item) return null;

    const installDir = this.installDir(slug);
    this.installStatus.set(slug, 'installing');
    this.installError.delete(slug);

    try {
      await fs.mkdir(installDir, { recursive: true });
      await execAsync(`npm install ${item.package} --prefix ${installDir}`, {
        timeout: 120000,
      });
      this.installStatus.set(slug, 'installed');
      this.logger.log(`Skill installed: ${item.package}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.installStatus.set(slug, 'error');
      this.installError.set(slug, message);
      this.logger.error(`Skill install failed: ${item.package}`, error);
    }

    return (
      (await this.findInstalled(projectId)).find((s) => s.slug === slug) ?? null
    );
  }

  async uninstall(
    projectId: string,
    slug: string,
  ): Promise<InstalledSkill | null> {
    const item = market.find((s) => s.slug === slug);
    if (!item) return null;

    try {
      await fs.rm(this.installDir(slug), { recursive: true, force: true });
      this.installStatus.delete(slug);
      this.installError.delete(slug);
      await this.toggleEnabled(projectId, slug, false);
    } catch (error) {
      this.logger.error(`Skill uninstall failed: ${item.package}`, error);
    }

    return (
      (await this.findInstalled(projectId)).find((s) => s.slug === slug) ?? null
    );
  }

  async toggleEnabled(
    projectId: string,
    slug: string,
    enabled: boolean,
  ): Promise<InstalledSkill | null> {
    const enabledSet = new Set(await this.readEnabled(projectId));
    if (enabled) enabledSet.add(slug);
    else enabledSet.delete(slug);
    await this.writeEnabled(projectId, Array.from(enabledSet));
    return (
      (await this.findInstalled(projectId)).find((s) => s.slug === slug) ?? null
    );
  }

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(this.skillsRoot, { recursive: true });
  }

  private installDir(slug: string): string {
    return path.join(this.skillsRoot, 'installed', slug);
  }

  private async detectStatus(slug: string): Promise<InstalledSkill['status']> {
    try {
      const pkgDir = path.join(this.installDir(slug), 'node_modules');
      await fs.access(pkgDir);
      return 'installed';
    } catch {
      return 'not-installed';
    }
  }

  private async readEnabled(projectId: string): Promise<string[]> {
    try {
      const raw = await fs.readFile(this.stateFile, 'utf-8');
      const state = JSON.parse(raw) as Record<string, string[]>;
      return state[projectId] ?? [];
    } catch {
      return [];
    }
  }

  private async writeEnabled(
    projectId: string,
    enabled: string[],
  ): Promise<void> {
    let state: Record<string, string[]> = {};
    try {
      const raw = await fs.readFile(this.stateFile, 'utf-8');
      state = JSON.parse(raw) as Record<string, string[]>;
    } catch {
      // ignore
    }
    state[projectId] = enabled;
    await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }
}
