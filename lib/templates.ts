export type TemplateId = 'scrum' | 'kanban' | 'bug-tracking' | 'general'

export type SectionKey = 'Summary' | 'Backlog' | 'Board' | 'Code' | 'Timeline' | 'Pages' | 'Forms'

export type Column = {
  id: string
  label: string
  wipLimit?: number
}

export type IssueType = {
  id: string
  label: string
  description: string
}

export type Priority = {
  id: string
  label: string
  level: number
  color: string
}

export type TemplateConfig = {
  id: TemplateId
  label: string
  description: string
  icon: string
  sections: SectionKey[]
  defaultView: SectionKey
  columns: Column[]
  issueTypes: IssueType[]
  priorities: Priority[]
}

export type Project = {
  name: string
  key: string
  template: TemplateId
  lead: string
  description: string
  access: 'private' | 'team'
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  scrum: {
    id: 'scrum',
    label: 'Scrum',
    description: 'Sprints, backlog, and velocity tracking',
    icon: 'FiRepeat',
    sections: ['Summary', 'Backlog', 'Board', 'Code', 'Timeline'],
    defaultView: 'Backlog',
    columns: [
      { id: 'sprint-backlog', label: 'Sprint Backlog' },
      { id: 'in-progress', label: 'In Progress', wipLimit: 3 },
      { id: 'in-review', label: 'In Review', wipLimit: 3 },
      { id: 'done', label: 'Done' },
    ],
    issueTypes: [
      { id: 'epic', label: 'Epic', description: 'A large body of work' },
      { id: 'story', label: 'Story', description: 'A user-facing feature' },
      { id: 'task', label: 'Task', description: 'A unit of work' },
      { id: 'subtask', label: 'Subtask', description: 'A breakdown of a task' },
      { id: 'bug', label: 'Bug', description: 'A problem to fix' },
    ],
    priorities: [
      { id: 'p0', label: 'Critical', level: 0, color: 'text-red-600' },
      { id: 'p1', label: 'High', level: 1, color: 'text-orange-500' },
      { id: 'p2', label: 'Medium', level: 2, color: 'text-yellow-600' },
      { id: 'p3', label: 'Low', level: 3, color: 'text-gray-500' },
    ],
  },
  kanban: {
    id: 'kanban',
    label: 'Kanban',
    description: 'Continuous flow and cycle time',
    icon: 'FiColumns',
    sections: ['Summary', 'Backlog', 'Board', 'Timeline'],
    defaultView: 'Board',
    columns: [
      { id: 'backlog', label: 'Backlog' },
      { id: 'to-do', label: 'To Do', wipLimit: 5 },
      { id: 'in-progress', label: 'In Progress', wipLimit: 3 },
      { id: 'in-review', label: 'In Review', wipLimit: 3 },
      { id: 'done', label: 'Done' },
    ],
    issueTypes: [
      { id: 'task', label: 'Task', description: 'A unit of work' },
      { id: 'subtask', label: 'Subtask', description: 'A breakdown of a task' },
    ],
    priorities: [
      { id: 'critical', label: 'Critical', level: 0, color: 'text-red-600' },
      { id: 'high', label: 'High', level: 1, color: 'text-orange-500' },
      { id: 'medium', label: 'Medium', level: 2, color: 'text-yellow-600' },
      { id: 'low', label: 'Low', level: 3, color: 'text-gray-500' },
    ],
  },
  'bug-tracking': {
    id: 'bug-tracking',
    label: 'Bug Tracking',
    description: 'Issue tracking and triage',
    icon: 'FiBug',
    sections: ['Summary', 'Backlog', 'Board', 'Code'],
    defaultView: 'Backlog',
    columns: [
      { id: 'new', label: 'New' },
      { id: 'triaged', label: 'Triaged' },
      { id: 'in-progress', label: 'In Progress', wipLimit: 3 },
      { id: 'in-review', label: 'In Review', wipLimit: 5 },
      { id: 'resolved', label: 'Resolved' },
      { id: 'closed', label: 'Closed' },
    ],
    issueTypes: [
      { id: 'bug', label: 'Bug', description: 'A problem to fix' },
      { id: 'improvement', label: 'Improvement', description: 'Enhance existing functionality' },
      { id: 'task', label: 'Task', description: 'A unit of work' },
    ],
    priorities: [
      { id: 'blocker', label: 'Blocker', level: 0, color: 'text-red-700' },
      { id: 'critical', label: 'Critical', level: 1, color: 'text-red-600' },
      { id: 'major', label: 'Major', level: 2, color: 'text-orange-500' },
      { id: 'minor', label: 'Minor', level: 3, color: 'text-yellow-600' },
      { id: 'trivial', label: 'Trivial', level: 4, color: 'text-gray-400' },
    ],
  },
  general: {
    id: 'general',
    label: 'General',
    description: 'Start from scratch',
    icon: 'FiFile',
    sections: ['Summary', 'Backlog', 'Board', 'Code', 'Timeline', 'Pages', 'Forms'],
    defaultView: 'Summary',
    columns: [
      { id: 'to-do', label: 'To Do' },
      { id: 'in-progress', label: 'In Progress' },
      { id: 'done', label: 'Done' },
    ],
    issueTypes: [
      { id: 'task', label: 'Task', description: 'A unit of work' },
    ],
    priorities: [
      { id: 'low', label: 'Low', level: 2, color: 'text-gray-500' },
      { id: 'medium', label: 'Medium', level: 1, color: 'text-yellow-600' },
      { id: 'high', label: 'High', level: 0, color: 'text-red-600' },
    ],
  },
}
