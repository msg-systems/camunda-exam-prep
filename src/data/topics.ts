import type { TopicMeta } from '@/types';

export const TOPICS: TopicMeta[] = [
  {
    id: 'modeling',
    name: 'Modeling (BPMN)',
    weight: 15,
    description: 'Model business processes using BPMN 2.0 elements.',
  },
  {
    id: 'configuring-processes',
    name: 'Configuring Processes',
    weight: 22,
    description: 'Configure BPMN processes for execution by Zeebe.',
  },
  {
    id: 'decisions-business-rules',
    name: 'Decisions & Business Rules',
    weight: 11,
    description: 'Model and configure DMN decisions, DRDs, and decision tables.',
  },
  {
    id: 'forms',
    name: 'Forms',
    weight: 5,
    description: 'Configure user-interaction forms.',
  },
  {
    id: 'connectors',
    name: 'Connectors',
    weight: 6,
    description: 'Inbound and outbound connectors and connector secrets.',
  },
  {
    id: 'extensions-integrations',
    name: 'Extensions & Integrations',
    weight: 25,
    description: 'FEEL, job workers, official clients, Camunda APIs, custom connectors, RPA.',
  },
  {
    id: 'managing-development',
    name: 'Managing the Development Process',
    weight: 15,
    description: 'Web Modeler, Operate, Play, deployment, migration, testing.',
  },
  {
    id: 'dev-environment',
    name: 'Setting up Dev Environment',
    weight: 1,
    description: 'C8 Run and Docker Compose local development.',
  },
];

export const TOPICS_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<
  TopicMeta['id'],
  TopicMeta
>;

export const EXAM_TOTAL_QUESTIONS = 60;
export const EXAM_DURATION_MINUTES = 75;
export const EXAM_PASS_PERCENTAGE = 65;
