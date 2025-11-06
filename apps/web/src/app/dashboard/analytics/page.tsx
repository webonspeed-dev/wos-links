import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, TrendingUp, Globe, Monitor, Smartphone } from "lucide-react";

export default function AnalyticsPage() {
  // Mock data
  const topCountries = [
    { country: "United States", clicks: 1234, percentage: 42 },
    { country: "United Kingdom", clicks: 567, percentage: 19 },
    { country: "Canada", clicks: 423, percentage: 14 },
    { country: "Germany", clicks: 312, percentage: 11 },
    { country: "France", clicks: 234, percentage: 8 },
  ];

  const deviceBreakdown = [
    { device: "Desktop", clicks: 1456, percentage: 52 },
    { device: "Mobile", clicks: 1123, percentage: 40 },
    { device: "Tablet", clicks: 221, percentage: 8 },
  ];

  const topReferrers = [
    { source: "Twitter", clicks: 892, percentage: 32 },
    { source: "Facebook", clicks: 678, percentage: 24 },
    { source: "LinkedIn", clicks: 456, percentage: 16 },
    { source: "Direct", clicks: 389, percentage: 14 },
    { source: "Email", clicks: 285, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your link performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Click Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Click Timeline</CardTitle>
          <CardDescription>Daily clicks over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-between gap-2">
            {/* Simple bar chart visualization */}
            {[65, 45, 78, 92, 56, 67, 88, 76, 54, 89, 92, 67, 78, 56, 43, 67, 89, 92, 76, 54, 67, 78, 92, 56, 67, 89, 76, 54, 67, 78].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
            <CardDescription>Where your clicks are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.country}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.clicks.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Breakdown
            </CardTitle>
            <CardDescription>How users are accessing your links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceBreakdown.map((item, index) => {
                const Icon = item.device === "Desktop" ? Monitor : item.device === "Mobile" ? Smartphone : Monitor;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.device}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.clicks.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Referrers
          </CardTitle>
          <CardDescription>Where your traffic is coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topReferrers.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.clicks.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Track the user journey from click to conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stage: "Link Clicks", count: 2800, percentage: 100 },
              { stage: "Page Views", count: 2450, percentage: 87 },
              { stage: "Add to Cart", count: 890, percentage: 32 },
              { stage: "Checkout", count: 445, percentage: 16 },
              { stage: "Purchase", count: 234, percentage: 8 },
            ].map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {stage.count.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-12 bg-gradient-to-r from-primary to-primary/60 rounded"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
