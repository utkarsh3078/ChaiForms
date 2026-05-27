import DashboardShell from "~/components/dashboard/DashboardShell";
import TopNavbar from "~/components/dashboard/TopNavbar";
import PageHeader from "~/components/dashboard/PageHeader";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <TopNavbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <PageHeader
          title="Analytics"
          subtitle="Track form traffic, completion rates, and response trends here."
        />

        <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 p-8 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
          Analytics is coming online soon. This route now exists so dashboard navigation stays
          within the app instead of falling through to a 404.
        </div>
      </div>
    </DashboardShell>
  );
}
