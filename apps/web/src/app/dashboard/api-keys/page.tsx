import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Key,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Code,
  Book,
  Zap,
} from "lucide-react";

export default function ApiKeysPage() {
  const apiKeys = [
    {
      id: 1,
      name: "Production API",
      key: "wos_live_a7f8b9c2d3e4f5a6b7c8d9e0f1a2b3c4",
      preview: "wos_live_a7f8...b3c4",
      scopes: ["read", "write"],
      lastUsed: "2 hours ago",
      created: "2024-01-10",
      requests: 12543,
    },
    {
      id: 2,
      name: "Development API",
      key: "wos_test_x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6",
      preview: "wos_test_x1y2...l5m6",
      scopes: ["read"],
      lastUsed: "1 day ago",
      created: "2024-01-05",
      requests: 8921,
    },
    {
      id: 3,
      name: "Analytics Dashboard",
      key: "wos_live_p9q8r7s6t5u4v3w2x1y0z9a8b7c6d5e4",
      preview: "wos_live_p9q8...d5e4",
      scopes: ["read"],
      lastUsed: "5 days ago",
      created: "2023-12-20",
      requests: 4532,
    },
  ];

  const codeExamples = {
    curl: `curl -X POST https://api.wos.link/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "destination": "https://example.com/page",
    "shortCode": "example"
  }'`,
    javascript: `const response = await fetch('https://api.wos.link/v1/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    destination: 'https://example.com/page',
    shortCode: 'example'
  })
});

const data = await response.json();
console.log(data.shortUrl);`,
    python: `import requests

response = requests.post(
    'https://api.wos.link/v1/links',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'destination': 'https://example.com/page',
        'shortCode': 'example'
    }
)

data = response.json()
print(data['shortUrl'])`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">Active keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,996</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,000</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43%</div>
            <p className="text-xs text-muted-foreground">Of monthly quota</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Keep your API keys secure. Never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{key.name}</h3>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                        {key.preview}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Scopes:</span>
                        {key.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                      <span>•</span>
                      <span>{key.requests.toLocaleString()} requests</span>
                      <span>•</span>
                      <span>Last used {key.lastUsed}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
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

      {/* Code Examples */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Example API usage in different languages</CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            <Book className="h-4 w-4" />
            Full Documentation
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* cURL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">cURL</h4>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                <code>{codeExamples.curl}</code>
              </pre>
            </div>

            {/* JavaScript */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">JavaScript / Node.js</h4>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                <code>{codeExamples.javascript}</code>
              </pre>
            </div>

            {/* Python */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Python</h4>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
                <code>{codeExamples.python}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-2">Security Best Practices</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>Never commit API keys to version control</li>
                <li>Use environment variables to store keys</li>
                <li>Rotate keys periodically for enhanced security</li>
                <li>Use separate keys for production and development</li>
                <li>Limit key scopes to only what's needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
