import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, MousePointerClick, DollarSign, Link2, Plus, ExternalLink, Copy } from "lucide-react";

export default function DashboardPage() {
  // Mock data - replace with real data later
  const stats = [
    {
      title: "Total Links",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Link2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Clicks",
      value: "1,429",
      change: "+23%",
      trend: "up",
      icon: MousePointerClick,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Click Rate",
      value: "59.5",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: "$2,450",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const recentLinks = [
    {
      id: 1,
      shortCode: "summer-sale",
      destination: "https://example.com/summer-sale-2024",
      clicks: 234,
      created: "2 hours ago",
    },
    {
      id: 2,
      shortCode: "product-launch",
      destination: "https://example.com/new-product",
      clicks: 189,
      created: "5 hours ago",
    },
    {
      id: 3,
      shortCode: "webinar-2024",
      destination: "https://example.com/webinar-registration",
      clicks: 156,
      created: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your links.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Link
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Create Link */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Create Link</CardTitle>
          <CardDescription>
            Shorten a URL with AI-powered slug suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3">
            <input
              type="url"
              placeholder="Enter your long URL..."
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button type="submit" className="gap-2">
              <Zap className="h-4 w-4" />
              Generate with AI
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription>Your most recently created links</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="relative rounded bg-primary/10 px-2 py-1 font-mono text-sm font-medium text-primary">
                      wos.link/{link.shortCode}
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {link.destination}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{link.clicks} clicks</span>
                    <span>•</span>
                    <span>{link.created}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </Button>
                  <Button variant="outline" size="sm">
                    Analytics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}
