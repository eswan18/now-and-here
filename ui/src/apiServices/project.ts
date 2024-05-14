import { Project } from '@/types/project';
import { extractErrorDetail } from '@/apiServices/common';

export function getProject(projectId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, window.location.origin);
  return fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = res.statusText;
        const data = await res.json();
        const errorDetail = extractErrorDetail(data);
        if (errorDetail) {
          errorMsg += `\n\n"${errorDetail}"`;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    });
}