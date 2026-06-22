import { Body, Controller, Get, Post } from '@nestjs/common';
import { GithubService, Repo } from './github.service';

interface ConnectDto {
  token?: string;
}

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('connect')
  connect(@Body() body: ConnectDto): { success: boolean } {
    return this.githubService.connect(body.token ?? '');
  }

  @Get('repos')
  async getRepos(): Promise<Repo[]> {
    return this.githubService.listRepos();
  }

  @Get('status')
  status(): { connected: boolean } {
    return { connected: this.githubService.isConnected() };
  }
}
