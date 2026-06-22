import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private token = '';

  connect(token: string): { success: boolean } {
    this.token = token.trim();
    return { success: true };
  }

  isConnected(): boolean {
    return !!this.token;
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
        }>
      >('https://api.github.com/user/repos?sort=updated&per_page=20', {
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
      }));
    } catch (error) {
      this.logger.error('GitHub list repos failed', error);
      return [];
    }
  }
}
