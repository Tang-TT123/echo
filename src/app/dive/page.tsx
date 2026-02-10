import { Card } from '@/components/ui/card';
import { Sidebar } from '@/components/sidebar';

export default function DivePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-[#e5e5e5] dark:border-[#38383a]">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                深潜 Dive
              </h1>
              <p className="text-sm text-[#86868b] mt-1">
                自我理解的空间
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-8">
          <Card className="p-8 bg-card border-[#e5e5e5] dark:border-[#38383a] card-shadow">
            <div className="text-center py-12">
              <p className="text-sm text-[#86868b] max-w-md mx-auto leading-relaxed">
                深潜空间
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
