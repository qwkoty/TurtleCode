import { Body, Controller, Get, Post } from '@nestjs/common';

interface ConnectDto {
  token?: string;
}

interface Repo {
  id: number;
  name: string;
  fullName: string;
  url: string;
}

@Controller('github')
export class GithubController {
  private connected = false;

  @Post('connect')
  connect(@Body() body: ConnectDto): { success: boolean; token?: string } {
    this.connected = true;
    return {
      success: true,
      token: body.token ?? 'mock-github-token',
    };
  }

  @Get('repos')
  getRepos(): Repo[] {
    return [
      {
        id: 1,
        name: 'turtlecode',
        fullName: 'turtlecode/turtlecode',
        url: 'https://github.com/turtlecode/turtlecode',
      },
      {
        id: 2,
        name: 'starter',
        fullName: 'turtlecode/starter',
        url: 'https://github.com/turtlecode/starter',
      },
    ];
  }
}
