import { Card } from "../../components/ui";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function AdminDashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Overview</h1>
      <Card className="mt-6 p-6">
        <p className="text-secondary">
          Signed in as <span className="text-fg">{user?.name}</span>. Order
          queues and sales summaries will appear here.
        </p>
      </Card>
    </div>
  );
}
