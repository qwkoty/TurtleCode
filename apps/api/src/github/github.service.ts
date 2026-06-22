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
      const res = await axios.get(
        'https://api.github.com/user/repos?sort=updated&per_page=20',
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
          timeout: 15000,
        },
      );
      return (res.data || []).map((r: Record<string, unknown>) => ({
        id: r.id as number,
        name: r.name as string,
        fullName: r.full_name as string,
        url: (r.html_url as string) || '',
        private: r.private as boolean,
      }));
    } catch (error) {
      this.logger.error('GitHub list repos failed', error);
      return [];
    }
  }
}
