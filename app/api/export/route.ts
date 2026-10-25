import { isAdmin } from '@/lib/auth';
import { exportAll, logActivity } from '@/lib/db';

export function GET() {
  if (!isAdmin()) return new Response('Not signed in', { status: 401 });
  logActivity('backup', 'JSON export');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(exportAll(), null, 2), { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename=fuelwell-backup-${day}.json` } });
}
