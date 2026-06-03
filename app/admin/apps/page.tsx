import { getAppReleases } from "@/lib/actions/app-release-actions";
import AppsClient from "@/components/admin/AppsClient";

export const revalidate = 0;

export default async function AppsPage() {
  const releases = await getAppReleases();
  return <AppsClient initialReleases={releases} />;
}
