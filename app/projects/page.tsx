import { getProjects } from "@/lib/actions/project-actions";
import ProjectsClient from "@/components/ProjectsClient";

export const metadata = {
  title: "SukaMCD | Selected Works",
  description: "A detailed archive of digital creations and web applications built by SukaMCD.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  
  return <ProjectsClient initialProjects={projects} />;
}
