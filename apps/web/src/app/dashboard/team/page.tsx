import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Users,
  Mail,
  Shield,
  Crown,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Chris Klein",
      email: "chris@example.com",
      role: "owner",
      avatar: "CK",
      status: "active",
      joinedDate: "2024-01-01",
      lastActive: "2 minutes ago",
      linksCreated: 234,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "admin",
      avatar: "SJ",
      status: "active",
      joinedDate: "2024-01-05",
      lastActive: "1 hour ago",
      linksCreated: 156,
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@example.com",
      role: "member",
      avatar: "MC",
      status: "active",
      joinedDate: "2024-01-10",
      lastActive: "3 hours ago",
      linksCreated: 89,
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      email: "emily@example.com",
      role: "member",
      avatar: "ER",
      status: "pending",
      joinedDate: "2024-01-20",
      lastActive: "Never",
      linksCreated: 0,
    },
  ];

  const pendingInvites = [
    {
      id: 1,
      email: "john@example.com",
      role: "member",
      invitedBy: "Chris Klein",
      invitedDate: "2024-01-18",
      expiresIn: "5 days",
    },
    {
      id: 2,
      email: "lisa@example.com",
      role: "admin",
      invitedBy: "Sarah Johnson",
      invitedDate: "2024-01-19",
      expiresIn: "6 days",
    },
  ];

  const roleDescriptions = [
    {
      role: "owner",
      icon: Crown,
      color: "text-yellow-600 bg-yellow-50",
      permissions: [
        "Full access to all features",
        "Manage billing and subscription",
        "Add/remove team members",
        "Delete workspace",
      ],
    },
    {
      role: "admin",
      icon: Shield,
      color: "text-blue-600 bg-blue-50",
      permissions: [
        "Create and manage links",
        "View all analytics",
        "Manage team members",
        "Configure integrations",
      ],
    },
    {
      role: "member",
      icon: Users,
      color: "text-gray-600 bg-gray-50",
      permissions: [
        "Create and edit own links",
        "View own analytics",
        "Use API keys",
        "Cannot manage team",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">1 pending invitation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Members online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Links Created</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">479</div>
            <p className="text-xs text-muted-foreground">By team this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seats Available</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Out of 10 total</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>
            Send an invitation to join your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter email address"
              className="flex-1"
            />
            <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option>Member</option>
              <option>Admin</option>
            </select>
            <Button className="gap-2">
              <Mail className="h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>{teamMembers.length} active members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const RoleIcon =
                member.role === "owner"
                  ? Crown
                  : member.role === "admin"
                  ? Shield
                  : Users;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      {member.status === "active" && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        {member.role === "owner" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            <Crown className="h-3 w-3" />
                            Owner
                          </span>
                        )}
                        {member.role === "admin" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                        {member.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {member.email}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{member.linksCreated} links created</span>
                        <span>•</span>
                        <span>Last active {member.lastActive}</span>
                        <span>•</span>
                        <span>Joined {member.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {member.role !== "owner" && (
                      <>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              {pendingInvites.length} pending invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invite.invitedBy} • Expires in {invite.expiresIn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {invite.role}
                    </span>
                    <Button variant="outline" size="sm">
                      Resend
                    </Button>
                    <Button variant="ghost" size="icon">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>
            Understanding team member permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {roleDescriptions.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.role} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${role.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold capitalize">{role.role}</h3>
                  </div>
                  <ul className="space-y-2">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
