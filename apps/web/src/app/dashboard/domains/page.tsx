import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Settings,
  Trash2,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function DomainsPage() {
  const domains = [
    {
      id: 1,
      domain: "links.acme.com",
      status: "active",
      verified: true,
      ssl: true,
      clicks: 12543,
      links: 234,
      addedDate: "2024-01-10",
      isPrimary: true,
    },
    {
      id: 2,
      domain: "go.acme.com",
      status: "active",
      verified: true,
      ssl: true,
      clicks: 8921,
      links: 156,
      addedDate: "2024-01-15",
      isPrimary: false,
    },
    {
      id: 3,
      domain: "track.acme.com",
      status: "pending",
      verified: false,
      ssl: false,
      clicks: 0,
      links: 0,
      addedDate: "2024-01-20",
      isPrimary: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Domains</h1>
          <p className="text-muted-foreground">
            Use your own branded domains for short links
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {/* Add Domain Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Add a Custom Domain</CardTitle>
          <CardDescription>
            Connect your domain to start creating branded short links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="e.g., links.yourdomain.com" className="flex-1" />
            <Button>Add Domain</Button>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How to add a custom domain:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Enter your domain name above</li>
                  <li>Add DNS records provided to your domain registrar</li>
                  <li>Wait for verification (usually takes 5-10 minutes)</li>
                  <li>SSL certificate will be automatically provisioned</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>{domains.length} domains connected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Domain Icon & Info */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{domain.domain}</h3>
                      {domain.isPrimary && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {domain.verified ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span>Pending Verification</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {domain.ssl ? (
                          <>
                            <Shield className="h-4 w-4 text-green-600" />
                            <span>SSL Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>SSL Pending</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{domain.links} links</span>
                      <span>•</span>
                      <span>{domain.clicks.toLocaleString()} clicks</span>
                      <span>•</span>
                      <span>Added {domain.addedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!domain.verified && (
                    <Button variant="outline" size="sm" className="gap-2">
                      View DNS Records
                    </Button>
                  )}
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

      {/* DNS Configuration Example */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>
            Add these records to your DNS provider for domain: <code className="text-primary">track.acme.com</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-2 py-1 text-sm">CNAME</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm">track</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm">cname.wos.link</code>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-2 py-1 text-sm">TXT</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm">_wos-verification</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm">wos-verify-a7f8b9c2d3e4f5a6</code>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-yellow-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-900">
                DNS changes can take up to 24 hours to propagate. We'll automatically verify once records are detected.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Verify Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 active, 1 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">390</div>
            <p className="text-xs text-muted-foreground">Across all domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21,464</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
