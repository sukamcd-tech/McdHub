import { getBackupHistory } from "@/lib/actions/backup-actions";
import BackupClient from "@/components/admin/BackupClient";

// Pastikan halaman ini dinamis dan selalu mengambil data terbaru dari database
export const revalidate = 0;

export default async function BackupPage() {
  const result = await getBackupHistory();
  const initialHistory = result.success && result.history ? result.history : [];

  return <BackupClient initialHistory={initialHistory} />;
}
