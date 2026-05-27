import DashboardShell from "~/components/dashboard/DashboardShell";
import TopNavbar from "~/components/dashboard/TopNavbar";
import PageHeader from "~/components/dashboard/PageHeader";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <TopNavbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          title="Settings"
          subtitle="Manage workspace preferences, profile details, and account controls."
        />

        <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Settings are not implemented yet, but the route exists so navigation and prefetching stay
          healthy.
        </div>
      </div>
    </DashboardShell>
  );
}
