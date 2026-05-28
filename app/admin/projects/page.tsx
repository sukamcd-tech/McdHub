import { getProjects } from "@/lib/actions/project-actions";
import ProjectsClient from "@/components/admin/ProjectsClient";

// Pastikan halaman ini dinamis dan selalu mengambil data terbaru dari database
export const revalidate = 0;

export default async function ProjectsPage() {
  const initialProjects = await getProjects();

  return <ProjectsClient initialProjects={initialProjects} />;
}
