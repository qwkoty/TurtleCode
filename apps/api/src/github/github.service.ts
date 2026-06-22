import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
  defaultBranch: string;
}

export interface Branch {
  name: string;
}

export interface RepoTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

export interface SelectedRepo {
  owner: string;
  repo: string;
  branch: string;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private token = '';
  private selected: SelectedRepo | null = null;

  connect(token: string): {
    success: boolean;
    login?: string;
    message?: string;
  } {
    const trimmed = token.trim();
    if (!trimmed) {
      return { success: false, message: 'Token is empty' };
    }
    this.token = trimmed;
    return { success: true };
  }

  isConnected(): boolean {
    return !!this.token;
  }

  getSelected(): SelectedRepo | null {
    return this.selected;
  }

  selectRepo(owner: string, repo: string, branch: string): SelectedRepo {
    this.selected = { owner, repo, branch };
    return this.selected;
  }

  async validateToken(): Promise<{
    valid: boolean;
    login?: string;
    message?: string;
  }> {
    if (!this.token) {
      return { valid: false, message: 'Token is empty' };
    }
    try {
      const res = await axios.get<{ login: string }>(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
          timeout: 15000,
        },
      );
      return { valid: true, login: res.data.login };
    } catch (error) {
      this.logger.error('GitHub token validation failed', error);
      return { valid: false, message: 'Invalid GitHub token or network error' };
    }
  }

  async listRepos(): Promise<Repo[]> {
    if (!this.token) return [];
    try {
      const res = await axios.get<
        Array<{
          id: number;
          name: string;
          full_name: string;
          html_url: string;
          private: boolean;
          default_branch: string;
        }>
      >('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
        timeout: 15000,
      });
      return (res.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        url: r.html_url || '',
        private: r.private,
        defaultBranch: r.default_branch,
      }));
    } catch (error) {
      this.logger.error('GitHub list repos failed', error);
      return [];
    }
  }

  async listBranches(owner: string, repo: string): Promise<Branch[]> {
    if (!this.token) return [];
    try {
      const res = await axios.get<Array<{ name: string }>>(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
          timeout: 15000,
        },
      );
      return (res.data || []).map((b) => ({ name: b.name }));
    } catch (error) {
      this.logger.error('GitHub list branches failed', error);
      return [];
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string,
  ): Promise<string | null> {
    if (!this.token) return null;
    try {
      const ref = branch ? `?ref=${encodeURIComponent(branch)}` : '';
      const res = await axios.get<{
        content: string;
        encoding: string;
      }>(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}${ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
          timeout: 15000,
        },
      );
      if (res.data.encoding === 'base64' && res.data.content) {
        return Buffer.from(res.data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      this.logger.error(
        `GitHub get file content failed: ${owner}/${repo}/${path}`,
        error,
      );
      return null;
    }
  }

  async getRepoTree(
    owner: string,
    repo: string,
    branch?: string,
  ): Promise<RepoTreeItem[]> {
    if (!this.token) return [];
    try {
      const ref = branch || 'main';
      const res = await axios.get<{
        tree: Array<{ path: string; type: string; sha: string }>;
      }>(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
          timeout: 15000,
        },
      );
      return (res.data.tree || [])
        .filter((t) => t.type === 'blob' || t.type === 'tree')
        .map((t) => ({
          path: t.path,
          type: t.type as 'blob' | 'tree',
          sha: t.sha,
        }));
    } catch (error) {
      this.logger.error('GitHub get repo tree failed', error);
      return [];
    }
  }
}
