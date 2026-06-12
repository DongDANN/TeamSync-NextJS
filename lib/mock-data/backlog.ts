import type { Issue, Comment, Attachment } from '@/lib/issues'

export const defaultIssues: Issue[] = [
  { id: 'TSK-4', title: 'User onboarding flow', typeId: 'epic', priorityId: 'high', status: 'in-progress', assignee: 'Taylor', description: 'Multi-step onboarding experience with team setup, project creation, and first task walkthrough.', createdAt: '2026-06-08', parentId: null },
  { id: 'TSK-2', title: 'Design system color tokens', typeId: 'story', priorityId: 'medium', status: 'open', assignee: 'Jordan', description: 'Define the full color palette and map to Tailwind theme.', createdAt: '2026-06-11', parentId: 'TSK-4' },
  { id: 'TSK-6', title: 'Optimize dashboard queries', typeId: 'improvement', priorityId: 'medium', status: 'open', assignee: 'Jordan', description: 'Reduce N+1 queries on the summary view.', createdAt: '2026-06-12', parentId: 'TSK-4' },
  { id: 'TSK-1', title: 'Set up CI/CD pipeline', typeId: 'task', priorityId: 'high', status: 'in-progress', assignee: 'Alex', description: 'Configure GitHub Actions for automated builds and deployments.', createdAt: '2026-06-10', parentId: null },
  { id: 'TSK-8', title: 'Configure GitHub Actions workflow', typeId: 'subtask', priorityId: 'high', status: 'done', assignee: 'Alex', description: 'Write the YAML workflow files for build and test.', createdAt: '2026-06-10', parentId: 'TSK-1' },
  { id: 'TSK-9', title: 'Add deploy step for staging', typeId: 'subtask', priorityId: 'high', status: 'open', assignee: 'Alex', description: 'Add deployment job to the workflow for the staging environment.', createdAt: '2026-06-11', parentId: 'TSK-1' },
  { id: 'TSK-3', title: 'Login page validation error', typeId: 'bug', priorityId: 'critical', status: 'in-review', assignee: 'Alex', description: 'Email field shows generic error instead of specific message.', createdAt: '2026-06-11', parentId: null },
  { id: 'TSK-5', title: 'Update API rate limits', typeId: 'task', priorityId: 'low', status: 'open', assignee: 'Unassigned', description: 'Increase rate limits for the public API tier.', createdAt: '2026-06-12', parentId: null },
  { id: 'TSK-7', title: 'Add dark mode support', typeId: 'story', priorityId: 'low', status: 'open', assignee: 'Unassigned', description: 'Implement theme toggle and dark color scheme.', createdAt: '2026-06-13', parentId: null },
  { id: 'TSK-10', title: 'Fix notification badge alignment', typeId: 'subtask', priorityId: 'low', status: 'done', assignee: 'Jordan', description: 'The notification count badge is offset in Safari.', createdAt: '2026-06-12', parentId: null },
]

export const defaultComments: Comment[] = [
  { id: 'c1', issueId: 'TSK-3', author: 'Jordan', body: 'I can reproduce this consistently. The error message shows "An error occurred" instead of the specific validation message. Looks like the catch block is swallowing the error details.', parentId: null, createdAt: '2026-06-11' },
  { id: 'c2', issueId: 'TSK-3', author: 'Alex', body: 'Good catch. The issue is in the auth callback handler — we need to pass through the error_description from the URL params.', parentId: 'c1', createdAt: '2026-06-11' },
  { id: 'c3', issueId: 'TSK-3', author: 'Taylor', body: 'I can take this one. Already working on the auth flow refactor.', parentId: 'c1', createdAt: '2026-06-12' },
  { id: 'c4', issueId: 'TSK-1', author: 'Alex', body: 'Initial config pushed to the feature branch. Still need to add the deployment step for the staging environment.', parentId: null, createdAt: '2026-06-10' },
]

export const defaultAttachments: Record<string, Attachment[]> = {
  'TSK-1': [
    { id: 'a1', fileName: 'ci-config.yml', fileSize: 2840, fileType: 'application/x-yaml', url: '#', uploadedAt: '2026-06-10', uploadedBy: 'Alex' },
  ],
  'TSK-3': [
    { id: 'a2', fileName: 'error-screenshot.png', fileSize: 142_000, fileType: 'image/png', url: 'placeholder', uploadedAt: '2026-06-11', uploadedBy: 'Jordan' },
  ],
}
