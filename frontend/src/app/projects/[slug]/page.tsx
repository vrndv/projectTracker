// frontend/src/app/projects/[slug]/page.tsx

import ProjectClientPage from "./ProjectClientPage";

export default function Page({
  params,
}: {
  params: { slug: string };
}) {
  return <ProjectClientPage slug={params.slug} />;
}