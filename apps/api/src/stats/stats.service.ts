import { Injectable } from '@nestjs/common';

export interface ProjectStats {
  projectId: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
}

@Injectable()
export class StatsService {
  private records = new Map<string, ProjectStats>();

  recordUsage(
    projectId: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
    },
    cacheHit = false,
  ): ProjectStats {
    const existing = this.records.get(projectId) ?? {
      projectId,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostUsd: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
    };

    const updated: ProjectStats = {
      ...existing,
      totalTokens: existing.totalTokens + usage.totalTokens,
      promptTokens: existing.promptTokens + usage.promptTokens,
      completionTokens: existing.completionTokens + usage.completionTokens,
      estimatedCostUsd: Number(
        (existing.estimatedCostUsd + usage.costUsd).toFixed(6),
      ),
      cacheHits: existing.cacheHits + (cacheHit ? 1 : 0),
      cacheMisses: existing.cacheMisses + (cacheHit ? 0 : 1),
    };
    updated.cacheHitRate =
      updated.cacheHits + updated.cacheMisses > 0
        ? Number(
            (
              (updated.cacheHits / (updated.cacheHits + updated.cacheMisses)) *
              100
            ).toFixed(2),
          )
        : 0;

    this.records.set(projectId, updated);
    return updated;
  }

  getStats(projectId: string): ProjectStats {
    return (
      this.records.get(projectId) ?? {
        projectId,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        estimatedCostUsd: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
      }
    );
  }
}
