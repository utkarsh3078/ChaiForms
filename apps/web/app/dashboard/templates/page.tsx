import DashboardShell from "~/components/dashboard/DashboardShell";
import TopNavbar from "~/components/dashboard/TopNavbar";
import PageHeader from "~/components/dashboard/PageHeader";

export default function TemplatesPage() {
  return (
    <DashboardShell>
      <TopNavbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          title="Templates"
          subtitle="Reuse starter layouts and form patterns without rebuilding them from scratch."
        />

        <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Templates are a placeholder for now, but the route is live so the sidebar link resolves
          correctly.
        </div>
      </div>
    </DashboardShell>
  );
}
