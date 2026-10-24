import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize real Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Seed data constants for fallback or initialization
export const INITIAL_USERS = [
  {
    id: 'user-admin-1',
    name: 'Sarah Chen (Admin)',
    email: 'admin@eventsphere.io',
    // 'AdminPass123!'
    passwordHash: '$2a$10$KKNuERfSqQ8TFmfOMEc7W.1kUZY6RtZVjewdypqMsqqX/zDSfRyX.',
    role: 'ADMIN' as const,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'user-organizer-1',
    name: 'Alex Rivera (Organizer)',
    email: 'alex@devconf.org',
    // 'OrganizerPass123!'
    passwordHash: '$2a$10$nmTwFrjidU00fWwsBclmq.EnP/K7.ctAOZQY.XU1UumDmg/YoqT1y',
    role: 'ORGANIZER' as const,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    id: 'user-organizer-2',
    name: 'Elena Rostova (Organizer)',
    email: 'elena@cloudsummit.tech',
    // 'OrganizerPass123!'
    passwordHash: '$2a$10$nmTwFrjidU00fWwsBclmq.EnP/K7.ctAOZQY.XU1UumDmg/YoqT1y',
    role: 'ORGANIZER' as const,
    createdAt: new Date('2026-01-03T00:00:00.000Z'),
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
  },
];

export const INITIAL_EVENTS = [
  {
    id: 'event-1',
    title: 'Global AI & LLM Systems Summit 2026',
    slug: 'global-ai-llm-systems-summit-2026',
    summary: 'The premier worldwide conference on building, deploying, and scaling agentic AI and production LLM applications.',
    description: `### Accelerate Your AI Engineering Journey

Join over 2,500 AI engineers, researchers, and tech leaders at the premier gathering for large language models, autonomous agents, and multimodal systems.

#### Key Highlights:
- **Architecting Multi-Agent Frameworks**: Production case studies from leading AI labs.
- **RAG at Enterprise Scale**: Solving latency, embedding drift, and retrieval accuracy.
- **Hands-on Masterclasses**: Fine-tuning open models, quantization, and evaluation benchmarks.
- **VIP Networking Dinner & Demo Showcase**: Connect with founders and engineers building the future of intelligence.

Whether you're building next-generation agent workflows or scaling production inference, this summit delivers actionable architectural patterns and deep technical insights.`,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'Artificial Intelligence',
    technologies: ['LLMs', 'Python', 'PyTorch', 'LangChain', 'Vector DBs'],
    startDateTime: new Date('2026-11-15T09:00:00.000Z'),
    endDateTime: new Date('2026-11-17T18:00:00.000Z'),
    timezone: 'America/Los_Angeles',
    venue: 'Moscone Center, 747 Howard St, San Francisco, CA',
    onlineUrl: null,
    format: 'IN_PERSON' as const,
    targetAudience: 'AI Engineers, Machine Learning Researchers, CTOs, and Senior Backend Architects',
    registrationUrl: 'https://tickets.eventsphere.io/global-ai-summit-2026',
    status: 'PUBLISHED' as const,
    organizerId: 'user-organizer-1',
    createdAt: new Date('2026-02-01T10:00:00.000Z'),
    updatedAt: new Date('2026-02-01T10:00:00.000Z'),
  },
  {
    id: 'event-2',
    title: 'Modern Distributed Systems & Cloud-Native Rust',
    slug: 'modern-distributed-systems-cloud-native-rust',
    summary: 'Master fault-tolerant distributed consensus, zero-cost abstractions, and high-performance microservices in Rust.',
    description: `### High-Throughput, Memory-Safe Distributed Engineering

This deep-dive virtual conference explores how leading tech giants are replacing critical infrastructure with Rust, Tokio, and modern Raft/Paxos implementations.

#### Featured Sessions:
1. **Zero-Allocation Network Protocols**: Writing ultra-fast TCP/QUIC engines in async Rust.
2. **Deterministic Simulation Testing**: How to catch edge-case distributed bugs before production.
3. **Rust + Kubernetes Operators**: Crafting lightweight controllers with minimal memory footprints.

Interactive Q&A stages and breakout rooms available for all attendees.`,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    category: 'Cloud & DevOps',
    technologies: ['Rust', 'Distributed Systems', 'Kubernetes', 'Tokio', 'gRPC'],
    startDateTime: new Date('2026-12-05T14:00:00.000Z'),
    endDateTime: new Date('2026-12-06T20:00:00.000Z'),
    timezone: 'UTC',
    venue: null,
    onlineUrl: 'https://stream.eventsphere.io/rust-distributed-2026',
    format: 'ONLINE' as const,
    targetAudience: 'Systems Programmers, Backend Engineers, and Infrastructure Architects',
    registrationUrl: 'https://register.devconf.org/rust-systems-2026',
    status: 'PUBLISHED' as const,
    organizerId: 'user-organizer-2',
    createdAt: new Date('2026-02-05T11:00:00.000Z'),
    updatedAt: new Date('2026-02-05T11:00:00.000Z'),
  },
  {
    id: 'event-3',
    title: 'React & Next.js Advanced Architecture World 2026',
    slug: 'react-nextjs-advanced-architecture-2026',
    summary: 'Deep dive into React Server Components, Streaming SSR, Compiler optimizations, and design system scale.',
    description: `### The Complete Guide to Enterprise Frontend at Scale

Elevate your frontend craftsmanship with international speakers and core team contributors.

#### Topics Covered:
- **RSC Internals & Streaming Hydration**: Eliminating waterfalls and optimizing initial load times.
- **Design Systems at 100M+ Users**: Token architecture, accessible primitives, and micro-frontends.
- **Full-Stack State Synchronization**: Optimistic mutations, offline-first caching, and realtime WebSockets.`,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    category: 'Web Development',
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    startDateTime: new Date('2026-11-28T10:00:00.000Z'),
    endDateTime: new Date('2026-11-29T17:00:00.000Z'),
    timezone: 'Europe/London',
    venue: 'ExCeL London, Royal Victoria Dock, London, UK',
    onlineUrl: null,
    format: 'IN_PERSON' as const,
    targetAudience: 'Senior Frontend Developers, UI Engineers, and Web Architects',
    registrationUrl: 'https://eventbrite.com/e/react-world-2026',
    status: 'PUBLISHED' as const,
    organizerId: 'user-organizer-1',
    createdAt: new Date('2026-02-10T12:00:00.000Z'),
    updatedAt: new Date('2026-02-10T12:00:00.000Z'),
  },
  {
    id: 'event-4',
    title: 'Zero Trust Cloud Security & Threat Hunting Workshop',
    slug: 'zero-trust-cloud-security-threat-hunting',
    summary: 'Hands-on offensive and defensive cloud security simulations in AWS, Azure, and Google Cloud environments.',
    description: `### Live Attack & Defend Cyber Range

Join security analysts and DevSecOps practitioners in an immersive hands-on cloud defense simulation.

- Identity governance and least privilege enforcement
- Automated runtime detection and response
- Supply chain security & SBOM validation`,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    category: 'Cybersecurity',
    technologies: ['AWS', 'Kubernetes', 'eBPF', 'Terraform', 'DevSecOps'],
    startDateTime: new Date('2026-12-12T13:00:00.000Z'),
    endDateTime: new Date('2026-12-12T19:00:00.000Z'),
    timezone: 'America/New_York',
    venue: null,
    onlineUrl: 'https://stream.eventsphere.io/cyber-defense-workshop',
    format: 'ONLINE' as const,
    targetAudience: 'Security Engineers, DevOps Leads, and SOC Analysts',
    registrationUrl: 'https://cybersec.io/register-zero-trust',
    status: 'PUBLISHED' as const,
    organizerId: 'user-organizer-2',
    createdAt: new Date('2026-02-12T09:00:00.000Z'),
    updatedAt: new Date('2026-02-12T09:00:00.000Z'),
  },
  {
    id: 'event-5',
    title: 'Next-Gen Mobile Engineering & Cross-Platform Frontiers',
    slug: 'next-gen-mobile-engineering-cross-platform',
    summary: 'Exploring Kotlin Multiplatform, React Native New Architecture, and on-device CoreML/NPU models.',
    description: `### Building Native-Speed Apps with Shared Codebases

Learn how top consumer apps maintain 99.99% crash-free rates while sharing 80%+ of business logic across iOS and Android. Includes code-along labs on neural engine hardware acceleration.`,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    category: 'Mobile',
    technologies: ['Kotlin Multiplatform', 'Swift', 'React Native', 'CoreML', 'Android'],
    startDateTime: new Date('2027-01-20T09:30:00.000Z'),
    endDateTime: new Date('2027-01-21T17:30:00.000Z'),
    timezone: 'Asia/Kolkata',
    venue: 'Bangalore International Exhibition Centre (BIEC), Bengaluru, India',
    onlineUrl: null,
    format: 'IN_PERSON' as const,
    targetAudience: 'Mobile Developers, iOS/Android Engineers, and Engineering Managers',
    registrationUrl: 'https://mobileconf.asia/tickets-2027',
    status: 'PUBLISHED' as const,
    organizerId: 'user-organizer-1',
    createdAt: new Date('2026-02-15T08:00:00.000Z'),
    updatedAt: new Date('2026-02-15T08:00:00.000Z'),
  },
  {
    id: 'event-draft-1',
    title: 'Quantum Computing Algorithms & Post-Quantum Cryptography [Draft]',
    slug: 'quantum-computing-algorithms-post-quantum-crypto',
    summary: 'A confidential overview of practical quantum error mitigation and NIST post-quantum standard migration.',
    description: `### Internal Draft: Quantum Frontiers Summit

This event is currently in draft mode while venue contracts and keynote speakers are being finalized. Only organizers and admins can view this event.`,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    category: 'Data Science',
    technologies: ['Qiskit', 'Quantum Computing', 'Cryptography', 'Python'],
    startDateTime: new Date('2027-02-10T10:00:00.000Z'),
    endDateTime: new Date('2027-02-11T16:00:00.000Z'),
    timezone: 'UTC',
    venue: null,
    onlineUrl: 'https://stream.eventsphere.io/quantum-draft',
    format: 'ONLINE' as const,
    targetAudience: 'Cryptographers, Quantum Researchers, and Security Officers',
    registrationUrl: 'https://quantumconf.org/register',
    status: 'DRAFT' as const,
    organizerId: 'user-organizer-1',
    createdAt: new Date('2026-02-18T10:00:00.000Z'),
    updatedAt: new Date('2026-02-18T10:00:00.000Z'),
  },
];
