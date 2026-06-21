'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PixelTurtle } from '@/components/turtle/PixelTurtle';
import { useAppStore } from '@/store/app-store';
import { formatNumber } from '@/lib/utils';
import { CheckCircle2, TestTube2 } from 'lucide-react';

const models = [
  { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash', desc: '响应速度快，成本低，日常开发首选' },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro', desc: '强推理，超长上下文，多文件协同' },
];

export default function SettingsPage() {
  const { settings, setSettings, agentStatus } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTimeout(() => {
      setSettings({ apiKeyConfigured: !!apiKey });
      setTesting(false);
    }, 1200);
  };

  return (
    <AppShell>
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">配置 AI 模型、API 与缓存选项</p>
              </div>
              <PixelTurtle status={agentStatus} size={64} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>模型选择</CardTitle>
                  <CardDescription>选择适合当前任务的 DeepSeek 模型</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSettings({ model: model.id as any })}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        settings.model === model.id
                          ? 'border-primary bg-primary/10 shadow-[0_0_16px_rgba(37,99,235,0.25)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.label}</span>
                        {settings.model === model.id && (
                          <CheckCircle2 size={18} className="text-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{model.desc}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>API 配置</CardTitle>
                  <CardDescription>输入 DeepSeek API Key 以启用 AI 对话</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleTestConnection}
                        disabled={testing || !apiKey}
                        variant="outline"
                      >
                        {testing ? (
                          <span className="animate-pulse">测试中</span>
                        ) : (
                          <>
                            <TestTube2 size={16} className="mr-2" />
                            测试连接
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Badge variant={settings.apiKeyConfigured ? 'success' : 'secondary'}>
                    {settings.apiKeyConfigured ? 'API Key 已配置' : '未配置 API Key'}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>缓存配置</CardTitle>
                  <CardDescription>优化响应速度与成本</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'cacheEnabled', label: '启用缓存', desc: 'Redis 基础缓存' },
                    { key: 'semanticCacheEnabled', label: '启用语义缓存', desc: '基于向量相似度缓存语义等价查询' },
                    { key: 'contextCompressionEnabled', label: '启用上下文压缩', desc: '压缩长上下文以减少 Token' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) =>
                          setSettings({ [item.key]: checked } as Partial<typeof settings>)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>统计</CardTitle>
                  <CardDescription>缓存命中率与费用节省</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="text-2xl font-bold text-turtle-cyan">
                        {(settings.cacheHitRate * 100).toFixed(0)}%
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">缓存命中率</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="text-2xl font-bold text-turtle-brightCyan">
                        {formatNumber(settings.tokensSaved, 0)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Token 节省</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="text-2xl font-bold text-turtle-lightBlue">
                        ${settings.costSaved.toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">费用节省</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
