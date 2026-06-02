import type { Metadata } from "next";
import { getProjects } from "@/lib/actions/project-actions";
import ProjectsClient from "@/components/ProjectsClient";

export const metadata: Metadata = {
  title: "SukaMCD | Selected Works",
  description: "A detailed archive of digital creations and web applications built by SukaMCD.",
  openGraph: {
    title: "SukaMCD | Selected Works",
    description: "A detailed archive of digital creations and web applications built by SukaMCD.",
    type: "website",
    url: "https://sukamcd.dev/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "SukaMCD | Selected Works",
    description: "A detailed archive of digital creations and web applications built by SukaMCD.",
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  
  return <ProjectsClient initialProjects={projects} />;
}
