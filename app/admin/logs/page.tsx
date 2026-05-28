import { getSystemLogs } from "@/lib/actions/log-actions";
import LogsClient from "@/components/admin/LogsClient";

// Pastikan halaman ini dinamis dan selalu mengambil data terbaru dari database
export const revalidate = 0;

export default async function LogsPage() {
  const result = await getSystemLogs(50);
  const initialLogs = result.success && result.logs ? result.logs : [];

  return <LogsClient initialLogs={initialLogs} />;
}
