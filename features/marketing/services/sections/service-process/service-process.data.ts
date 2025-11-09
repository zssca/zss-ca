import type { ServiceProcessData } from './service-process.types'

export const serviceProcessData: ServiceProcessData = {
  heading: 'From kickoff to launch in 30 days',
  subheading: 'A structured weekly cadence keeps every subscription moving forward.',
  phases: [
    {
      id: 1,
      label: 'Phase 1',
      title: 'Week 1: Strategy sprint',
      description: 'Discovery workshops, messaging, and a prioritized backlog of launch deliverables.',
      deliverables: ['Kickoff workshop', 'Messaging + page outlines', 'Prioritized backlog'],
    },
    {
      id: 2,
      label: 'Phase 2',
      title: 'Week 2–3: Design & build',
      description: 'High-fidelity design, responsive builds, and CMS wiring handled in parallel.',
      deliverables: ['High-fidelity designs', 'Responsive builds', 'Analytics + CMS implementation'],
    },
    {
      id: 3,
      label: 'Phase 3',
      title: 'Week 4: Launch & optimize',
      description: 'QA, analytics tagging, deployment, and a measurement plan for the next iteration.',
      deliverables: ['QA + accessibility report', 'Production deploy', 'Measurement plan + roadmap'],
    },
  ],
}
