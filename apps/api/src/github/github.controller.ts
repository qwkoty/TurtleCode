import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GithubService, Repo } from './github.service';

interface ConnectDto {
  token?: string;
}

interface SelectDto {
  owner: string;
  repo: string;
  branch: string;
}

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('connect')
  async connect(
    @Body() body: ConnectDto,
  ): Promise<{ success: boolean; login?: string; message?: string }> {
    const result = this.githubService.connect(body.token ?? '');
    if (!result.success) return result;
    const validation = await this.githubService.validateToken();
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }
    return { success: true, login: validation.login };
  }

  @Get('status')
  status(): {
    connected: boolean;
    selected: ReturnType<GithubService['getSelected']>;
  } {
    return {
      connected: this.githubService.isConnected(),
      selected: this.githubService.getSelected(),
    };
  }

  @Get('repos')
  async getRepos(): Promise<Repo[]> {
    return this.githubService.listRepos();
  }

  @Post('select')
  selectRepo(@Body() body: SelectDto): SelectDto {
    return this.githubService.selectRepo(body.owner, body.repo, body.branch);
  }

  @Get('selected')
  getSelected(): { selected: ReturnType<GithubService['getSelected']> } {
    return { selected: this.githubService.getSelected() };
  }

  @Get('repos/:owner/:repo/branches')
  async getBranches(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ): Promise<{ name: string }[]> {
    return this.githubService.listBranches(owner, repo);
  }

  @Get('repos/:owner/:repo/contents')
  async getContents(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('path') path: string,
    @Query('branch') branch?: string,
  ): Promise<{ content: string | null }> {
    const content = await this.githubService.getFileContent(
      owner,
      repo,
      path,
      branch,
    );
    return { content };
  }

  @Get('repos/:owner/:repo/tree')
  async getTree(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch?: string,
  ): Promise<{ tree: import('./github.service').RepoTreeItem[] }> {
    const tree = await this.githubService.getRepoTree(owner, repo, branch);
    return { tree };
  }
}
