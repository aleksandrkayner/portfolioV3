/**
 * Central content store — edit this file to personalize the portfolio.
 * Widget components read from these exports; no copy is hard-coded in UI files.
 */

export const profile = {
  name: 'Alex Kayner',
  role: 'Full-Stack Developer',
  tagline: 'Building thoughtful interfaces and reliable systems.',
  location: 'Your City',
  email: 'hello@example.com',
  availability: 'Open to opportunities',
  avatarInitials: 'AK',
} as const

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'mail' },
] as const

export const stats = [
  { label: 'Years experience', value: '5+' },
  { label: 'Projects shipped', value: '20+' },
  { label: 'Technologies', value: '15+' },
] as const

export const skills = [
  { name: 'TypeScript', level: 90 },
  { name: 'React', level: 88 },
  { name: 'Node.js', level: 82 },
  { name: 'PostgreSQL', level: 75 },
  { name: 'Tailwind CSS', level: 85 },
  { name: 'AWS / Cloud', level: 70 },
] as const

export const projects = [
  {
    id: 'project-1',
    title: 'Dashboard Analytics',
    description: 'Real-time metrics dashboard with customizable widgets and role-based access.',
    tags: ['React', 'TypeScript', 'D3'],
    href: '#',
    status: 'Live' as const,
  },
  {
    id: 'project-2',
    title: 'API Gateway Service',
    description: 'High-throughput REST and GraphQL gateway with caching and rate limiting.',
    tags: ['Node.js', 'Redis', 'Docker'],
    href: '#',
    status: 'Live' as const,
  },
  {
    id: 'project-3',
    title: 'Design System',
    description: 'Component library and documentation site used across multiple product teams.',
    tags: ['React', 'Storybook', 'Tailwind'],
    href: '#',
    status: 'In progress' as const,
  },
] as const

export const experience = [
  {
    id: 'exp-1',
    role: 'Senior Developer',
    company: 'Company Name',
    period: '2022 — Present',
    summary: 'Led frontend architecture and mentored junior engineers on a product squad.',
  },
  {
    id: 'exp-2',
    role: 'Software Engineer',
    company: 'Previous Co',
    period: '2019 — 2022',
    summary: 'Built customer-facing features and improved CI/CD pipelines.',
  },
] as const

export const nowLearning = ['Rust', 'WebGPU', 'System design'] as const
