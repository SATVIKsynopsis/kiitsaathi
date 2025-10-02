import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuthViolation {
  id: string;
  user_id: string | null;
  email: string;
  violation_type: string;
  provider: string | null;
  reason: string | null;
  created_at: string;
  metadata: any;
}

interface AuthEvent {
  id: string;
  user_id: string | null;
  email: string;
  event_type: string;
  provider: string | null;
  created_at: string;
}

export function AuthViolationsPanel() {
  const [violations, setViolations] = useState<AuthViolation[]>([]);
  const [recentEvents, setRecentEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch violations (last 100)
      const { data: violationsData } = await supabase
        .from('auth_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch recent auth events (last 50)
      const { data: eventsData } = await supabase
        .from('auth_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setViolations(violationsData || []);
      setRecentEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViolationBadgeColor = (type: string) => {
    switch (type) {
      case 'domain_not_allowed':
        return 'destructive';
      case 'email_not_verified':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'default';
      case 'signin':
        return 'default';
      case 'oauth_callback':
        return 'default';
      case 'verification_success':
        return 'default';
      case 'verification_failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentViolations = violations.filter(
    v => new Date(v.created_at) > last24Hours
  ).length;
  const domainRejections = violations.filter(
    v => v.violation_type === 'domain_not_allowed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViolations}</div>
            <p className="text-xs text-muted-foreground">Recent attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domain Rejections</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainRejections}</div>
            <p className="text-xs text-muted-foreground">Non-KIIT emails blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Violations</CardTitle>
          <CardDescription>
            Rejected authentication attempts and policy violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No violations recorded
                  </TableCell>
                </TableRow>
              ) : (
                violations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-mono text-sm">
                      {violation.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getViolationBadgeColor(violation.violation_type)}>
                        {violation.violation_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {violation.provider || 'email'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {violation.reason}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(violation.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Auth Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Authentication Events</CardTitle>
          <CardDescription>
            Successful authentication and verification events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No events recorded
                  </TableCell>
                </TableRow>
              ) : (
                recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">
                      {event.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEventBadgeColor(event.event_type)}>
                        {event.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {event.provider || 'email'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
