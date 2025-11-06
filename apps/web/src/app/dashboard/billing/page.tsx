import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function BillingPage() {
  const currentPlan = {
    name: "Pro",
    price: 49,
    billingCycle: "monthly",
    nextBillingDate: "2024-02-20",
    features: [
      "5,000 links per month",
      "Unlimited clicks",
      "AI-powered features",
      "Custom domains (1)",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for trying out WOS Links",
      features: [
        "100 links/month",
        "1,000 clicks/month",
        "Basic analytics",
        "Community support",
      ],
      current: false,
    },
    {
      name: "Pro",
      price: 49,
      description: "For power users and small teams",
      features: [
        "5,000 links/month",
        "Unlimited clicks",
        "AI features",
        "1 custom domain",
        "Advanced analytics",
        "API access",
        "Priority support",
      ],
      current: true,
      popular: true,
    },
    {
      name: "Business",
      price: 99,
      description: "For teams and growing businesses",
      features: [
        "Unlimited links",
        "Unlimited clicks",
        "All AI features",
        "5 custom domains",
        "Team collaboration (5 users)",
        "White label",
        "Advanced API",
        "24/7 support",
      ],
      current: false,
    },
  ];

  const invoices = [
    {
      id: "INV-001234",
      date: "2024-01-20",
      amount: 49.0,
      status: "paid",
      plan: "Pro Plan",
    },
    {
      id: "INV-001233",
      date: "2023-12-20",
      amount: 49.0,
      status: "paid",
      plan: "Pro Plan",
    },
    {
      id: "INV-001232",
      date: "2023-11-20",
      amount: 49.0,
      status: "paid",
      plan: "Pro Plan",
    },
  ];

  const usageStats = [
    {
      label: "Links Created",
      current: 1234,
      limit: 5000,
      percentage: 25,
    },
    {
      label: "API Requests",
      current: 15432,
      limit: 100000,
      percentage: 15,
    },
    {
      label: "Team Members",
      current: 4,
      limit: 5,
      percentage: 80,
    },
    {
      label: "Custom Domains",
      current: 2,
      limit: 5,
      percentage: 40,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                Billed {currentPlan.billingCycle} • Next payment on{" "}
                {currentPlan.nextBillingDate}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${currentPlan.price}</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Plan Features</h4>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full">
                Change Plan
              </Button>
              <Button variant="outline" className="w-full">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage This Month */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Your current usage across all features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {usageStats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stat.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.current.toLocaleString()} / {stat.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stat.percentage > 80 ? "bg-yellow-500" : "bg-primary"
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-lg border p-6 ${
                  plan.current ? "border-primary shadow-lg" : ""
                } ${plan.popular ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Update
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 gap-2">
            <CreditCard className="h-4 w-4" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download past invoices</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono">{invoice.id}</code>
                    </td>
                    <td className="px-4 py-3 text-sm">{invoice.date}</td>
                    <td className="px-4 py-3 text-sm">{invoice.plan}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Update your billing details and tax information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="Acme Inc"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">VAT/Tax ID</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="US123456789"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Billing Address</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="123 Main St, San Francisco, CA 94105"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
