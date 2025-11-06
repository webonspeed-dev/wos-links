import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  BarChart3,
  ExternalLink,
  Star,
} from "lucide-react";

export default function LinksPage() {
  // Mock data - replace with real data later
  const links = [
    {
      id: 1,
      shortCode: "summer-sale",
      destination: "https://example.com/summer-sale-2024",
      title: "Summer Sale 2024",
      clicks: 1234,
      conversions: 89,
      revenue: "$2,450",
      created: "2024-01-15",
      status: "active",
      isFavorite: true,
    },
    {
      id: 2,
      shortCode: "product-launch",
      destination: "https://example.com/new-product",
      title: "Product Launch",
      clicks: 892,
      conversions: 45,
      revenue: "$1,230",
      created: "2024-01-14",
      status: "active",
      isFavorite: false,
    },
    {
      id: 3,
      shortCode: "webinar-2024",
      destination: "https://example.com/webinar-registration",
      title: "Webinar Registration",
      clicks: 567,
      conversions: 234,
      revenue: "$0",
      created: "2024-01-13",
      status: "active",
      isFavorite: true,
    },
    {
      id: 4,
      shortCode: "blog-post-1",
      destination: "https://example.com/blog/ai-marketing",
      title: "AI Marketing Blog Post",
      clicks: 423,
      conversions: 12,
      revenue: "$450",
      created: "2024-01-12",
      status: "active",
      isFavorite: false,
    },
    {
      id: 5,
      shortCode: "black-friday",
      destination: "https://example.com/black-friday-deals",
      title: "Black Friday Deals",
      clicks: 3421,
      conversions: 456,
      revenue: "$12,450",
      created: "2023-11-20",
      status: "expired",
      isFavorite: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Links</h1>
          <p className="text-muted-foreground">
            Manage and track all your shortened links
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Link
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search links..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Links</CardTitle>
              <CardDescription>{links.length} total links</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button variant="ghost" size="sm">
                Most Recent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Link
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Clicks
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Conversions
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="pb-3 text-center text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {links.map((link) => (
                  <tr key={link.id} className="group hover:bg-accent/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
                          <Star
                            className={`h-4 w-4 ${
                              link.isFavorite ? "fill-yellow-500 text-yellow-500" : ""
                            }`}
                          />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-primary/10 px-2 py-0.5 text-sm font-mono font-medium text-primary">
                              {link.shortCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {link.title && (
                            <p className="mt-1 text-sm text-muted-foreground">{link.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <p className="max-w-xs truncate text-sm text-muted-foreground">
                          {link.destination}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium">{link.clicks.toLocaleString()}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium">{link.conversions}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({((link.conversions / link.clicks) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium text-green-600">{link.revenue}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          link.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {link.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 24 links</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
