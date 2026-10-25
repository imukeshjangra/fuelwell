import { isAdmin } from '@/lib/auth';
import { allPosts, allMessages, allSubscribers, viewsByDay, recentActivity, adminStats, categoryCounts, allCategories } from '@/lib/db';
import Admin from './Admin';
export const dynamic = 'force-dynamic';
export default function Page() {
  const ok = isAdmin();
  return (
    <Admin
      authed={ok}
      categories={ok ? allCategories() : []}
      posts={ok ? allPosts() : []}
      messages={ok ? allMessages() : []}
      subs={ok ? allSubscribers() : []}
      daily={ok ? viewsByDay(14) : []}
      activity={ok ? recentActivity(50) : []}
      stats={ok ? adminStats() : { posts: 0, unread: 0, subsWeek: 0, subsPrev: 0, viewsPrev7: 0 }}
      cats={ok ? categoryCounts() : []}
    />
  );
}
