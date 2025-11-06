import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Webhook,
  CheckCircle2,
  Plus,
  Settings,
  Trash2,
  ExternalLink,
  Zap,
  AlertCircle,
} from "lucide-react";

export default function IntegrationsPage() {
  const connectedIntegrations = [
    {
      id: 1,
      name: "Slack",
      description: "Get notified in Slack when links are clicked",
      icon: "💬",
      status: "connected",
      connectedDate: "2024-01-15",
      lastActivity: "2 hours ago",
    },
    {
      id: 2,
      name: "Google Analytics",
      description: "Send click events to Google Analytics",
      icon: "📊",
      status: "connected",
      connectedDate: "2024-01-10",
      lastActivity: "5 minutes ago",
    },
  ];

  const availableIntegrations = [
    {
      id: 1,
      name: "Zapier",
      description: "Connect WOS Links to 5,000+ apps",
      icon: "⚡",
      category: "Automation",
    },
    {
      id: 2,
      name: "Stripe",
      description: "Track revenue attribution from links",
      icon: "💳",
      category: "Payments",
    },
    {
      id: 3,
      name: "HubSpot",
      description: "Sync link data with HubSpot CRM",
      icon: "🎯",
      category: "CRM",
    },
    {
      id: 4,
      name: "Mailchimp",
      description: "Add link tracking to email campaigns",
      icon: "📧",
      category: "Email Marketing",
    },
    {
      id: 5,
      name: "Notion",
      description: "Embed link analytics in Notion pages",
      icon: "📝",
      category: "Productivity",
    },
    {
      id: 6,
      name: "Discord",
      description: "Get link notifications in Discord",
      icon: "🎮",
      category: "Communication",
    },
    {
      id: 7,
      name: "Shopify",
      description: "Track product link conversions",
      icon: "🛍️",
      category: "E-commerce",
    },
    {
      id: 8,
      name: "Make (Integromat)",
      description: "Build powerful automation workflows",
      icon: "🔧",
      category: "Automation",
    },
  ];

  const webhooks = [
    {
      id: 1,
      name: "Production Webhook",
      url: "https://api.example.com/webhooks/wos-links",
      events: ["link.created", "link.clicked", "link.converted"],
      status: "active",
      lastTriggered: "5 minutes ago",
    },
    {
      id: 2,
      name: "Analytics Webhook",
      url: "https://analytics.example.com/track",
      events: ["link.clicked"],
      status: "active",
      lastTriggered: "1 hour ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect WOS Links with your favorite tools
          </p>
        </div>
      </div>

      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Integrations</CardTitle>
            <CardDescription>
              {connectedIntegrations.length} active integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {integration.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Connected {integration.connectedDate}</span>
                        <span>•</span>
                        <span>Last activity {integration.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Expand WOS Links functionality with these integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="rounded-lg border p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                    {integration.icon}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {integration.category}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{integration.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {integration.description}
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="h-3 w-3" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Send real-time events to your custom endpoints
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{webhook.name}</h4>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {webhook.status}
                    </span>
                  </div>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {webhook.url}
                  </code>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">Events:</p>
                    {webhook.events.map((event, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last triggered {webhook.lastTriggered}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Webhook Events Available:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li><code>link.created</code> - Triggered when a new link is created</li>
                  <li><code>link.clicked</code> - Triggered when a link is clicked</li>
                  <li><code>link.converted</code> - Triggered when a conversion happens</li>
                  <li><code>link.updated</code> - Triggered when a link is updated</li>
                  <li><code>link.deleted</code> - Triggered when a link is deleted</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Integration</CardTitle>
          <CardDescription>
            Build your own integration using the WOS Links API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h4 className="font-medium mb-1">API Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Full REST API documentation with code examples
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Docs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-2">Need an integration?</p>
              <p className="text-yellow-800">
                Can't find the integration you need? Let us know and we'll consider
                adding it to our roadmap. You can also build custom integrations
                using our API.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-yellow-600 text-yellow-900 hover:bg-yellow-100"
              >
                Request Integration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
