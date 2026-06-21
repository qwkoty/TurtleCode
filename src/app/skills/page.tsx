'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import * as LucideIcons from 'lucide-react';
import { Search, Settings2, Download, Trash2 } from 'lucide-react';

const categories = ['全部', '开发工具', '数据库', '部署工具', '设计工具', '浏览器工具', 'Agent 工具'];

export default function SkillsPage() {
  const { plugins, togglePlugin, installPlugin } = useAppStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');

  const installed = plugins.filter((p) => p.installed);
  const marketplace = plugins.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === '全部' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Skills</h1>
              <p className="text-muted-foreground">管理 Agent 能力，安装插件扩展功能</p>
            </div>

            <Tabs defaultValue="installed" className="w-full">
              <TabsList className="bg-white/5">
                <TabsTrigger value="installed">我的技能</TabsTrigger>
                <TabsTrigger value="marketplace">插件市场</TabsTrigger>
              </TabsList>

              <TabsContent value="installed" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {installed.map((plugin, index) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      index={index}
                      onToggle={() => togglePlugin(plugin.id)}
                    />
                  ))}
                  {installed.length === 0 && (
                    <p className="text-muted-foreground col-span-full">尚未安装任何插件</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="marketplace" className="mt-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="搜索插件..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                          category === cat
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {marketplace.map((plugin, index) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      index={index}
                      onToggle={() => togglePlugin(plugin.id)}
                      onInstall={() => installPlugin(plugin.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PluginCard({
  plugin,
  index,
  onToggle,
  onInstall,
}: {
  plugin: any;
  index: number;
  onToggle: () => void;
  onInstall?: () => void;
}) {
  const Icon = (LucideIcons as any)[plugin.icon] || LucideIcons.Puzzle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass border-white/10 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Icon size={20} />
            </div>
            <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
          </div>
          <CardTitle className="mt-3 text-base">{plugin.name}</CardTitle>
          <CardDescription className="text-xs">{plugin.description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">v{plugin.version}</span>
            <div className="flex items-center gap-2">
              {plugin.installed ? (
                <>
                  <button className="p-1.5 rounded-md text-muted-foreground hover:bg-white/10">
                    <Settings2 size={14} />
                  </button>
                  <Switch checked={plugin.enabled} onCheckedChange={onToggle} />
                </>
              ) : (
                <Button size="sm" onClick={onInstall}>
                  <Download size={14} className="mr-1.5" />
                  安装
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
