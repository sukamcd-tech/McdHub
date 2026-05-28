import { getSecurityOverview } from "@/lib/actions/security-actions";
import { getSystemLogs } from "@/lib/actions/log-actions";
import SecurityClient from "@/components/admin/SecurityClient";

// Pastikan halaman ini dinamis dan selalu mengambil data terbaru dari database
export const revalidate = 0;

export default async function SecurityPage() {
  const [overviewResult, logsResult] = await Promise.all([
    getSecurityOverview(),
    getSystemLogs(20)
  ]);

  const initialOverview = overviewResult.success && overviewResult.data ? overviewResult.data : null;
  const initialLogs = logsResult.success && logsResult.logs 
    ? logsResult.logs.filter((l: any) => l.category === "SECURITY") 
    : [];

  return <SecurityClient initialOverview={initialOverview} initialLogs={initialLogs} />;
}
