export const profile = {
  name: 'Adarsh P A',
  brand: 'ADARSH',
  title: 'Software Engineer | React & React Native Developer',
  shortTitle: 'Software Engineer',
  location: 'Pathanamthitta, Kerala, India',
  phone: '+91 7592876321',
  email: 'adarshputhuparambil324@gmail.com',
  github: 'https://github.com/AdarshPuthuparambil',
  linkedin: 'https://www.linkedin.com/in/adarsh-puthuparambil-0a61a7175',
  instagram: 'https://www.instagram.com/adarsh_puthuparambil',
  whatsapp: 'https://wa.me/917592876321',
  resume: '/ADARSH Resume.pdf',
  resumeFileName: 'ADARSH-Resume.pdf',
  summary:
    'Software Engineer with 2+ years of experience in React, React Native, and TypeScript. I build web and cross-platform mobile applications, integrate REST APIs and GraphQL, and partner with clients to ship scalable business solutions.',
  headline:
    'I craft polished web and mobile products with React, React Native, and TypeScript.',
  languages: ['Malayalam', 'English', 'Tamil'],
}

export type ExperienceProject = {
  name: string
  stack: string
  description: string
  logo?: string
  link?: string
  linkLabel?: string
}

export type ExperienceItem = {
  company: string
  role: string
  period: string
  logo: string
  companyUrl: string
  projects: ExperienceProject[]
}

export const experience: ExperienceItem[] = [
  {
    company: 'VOFOX Solutions',
    role: 'Software Engineer',
    period: 'June 2024 – Present',
    logo: '/Vofox_logo.png',
    companyUrl: 'https://vofoxsolutions.com/',
    projects: [
      {
        name: 'PAM',
        stack: 'React Native (Android & iOS)',
        logo: '/PAMLogo.jpeg',
        description:
          'Map-powered postal address management and navigation application.',
        link: 'https://getmethere.in',
        linkLabel: 'getmethere.in',
      },
      {
        name: 'StandbyTravel',
        stack: 'React Native, React.js, TypeScript',
        logo: '/StandbyLogo.png',
        link: 'https://standbyapp.theflightx.com',
        description:
          'Flight ticket booking platform for airline employees across mobile (Android & iOS) and web.',
        linkLabel: 'standbytravel',
      },
      {
        name: 'SmarTrak.ai (Cisco)',
        stack: 'React.js, TypeScript',
        logo: '/CiscoLogo.png',
        description:
          'AI-powered platform delivering insights into Cisco data for revenue opportunities, network modernization, and renewal optimization.',
      },
    ],
  },
  {
    company: 'IONAUGHT Technologies',
    role: 'React Developer',
    period: 'January 2024 – June 2024',
    logo: '/ionaught_logo.png',
    companyUrl: 'https://www.ionaught.com/',
    projects: [
      {
        name: 'Frontend delivery',
        stack: 'React.js, TypeScript',
        description:
          'Built and iterated on client-facing React interfaces with a focus on clean UI, API integration, and maintainable component architecture.',
      },
    ],
  },
]

export const projects = [
  {
    title: 'E-Commerce Website',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
    description:
      'E-commerce platform with product management, wishlist, cart, and order flows.',
  },
  {
    title: 'E-Swatcha',
    stack: ['ASP.NET', 'C#', 'SQL'],
    description:
      'Waste management application for reporting and managing waste collection requests.',
  },
  {
    title: 'Resort Management System',
    stack: ['Python', 'Django', 'SQLite'],
    description:
      'Online resort booking system with room management and reservation workflows.',
  },
]

export const skillGroups = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'C#', 'SQL'],
  },
  {
    label: 'Frontend',
    items: [
      'React.js',
      'React Native',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Bootstrap',
    ],
  },
  {
    label: 'Backend & Data',
    items: ['ASP.NET MVC', 'Django', 'REST API', 'PostgreSQL', 'SQLite'],
  },
  {
    label: 'Tools & Platforms',
    items: [
      'Git',
      'AWS',
      'GraphQL',
      'Firebase',
      'Android',
      'iOS',
      'Xcode',
      'Android Studio',
    ],
  },
]

export const education = [
  {
    degree: 'Bachelor of Computer Applications (BCA)',
    school: 'MES College Erumely',
    detail: 'Mahatma Gandhi University',
  },
]

export const certifications = [
  {
    title: 'Software Developer',
    year: '2023',
    org: 'KKM-Soft [DDU-GKY]',
    focus: [
      'ASP.NET',
      'MVC',
      'C#',
      'C++',
      'HTML',
      'CSS',
      'Bootstrap',
      'Photoshop',
    ],
  },
  {
    title: 'Python – Django Fullstack',
    year: '2022',
    org: 'Unique Occasio Tech Kochi [STED-Council]',
    focus: ['Python', 'Django', 'Bootstrap', 'JavaScript', 'Flask', 'HTML'],
  },
]

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export const socialLinks = [
  {
    id: 'linkedin' as const,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/adarsh-puthuparambil-0a61a7175',
  },
  {
    id: 'github' as const,
    label: 'GitHub',
    href: 'https://github.com/AdarshPuthuparambil',
  },
  {
    id: 'instagram' as const,
    label: 'Instagram',
    href: 'https://www.instagram.com/adarsh_puthuparambil',
  },
  {
    id: 'whatsapp' as const,
    label: 'WhatsApp',
    href: 'https://wa.me/917592876321',
  },
  {
    id: 'E-mail' as const,
    label: 'E-mail',
    href: 'mailto:adarshputhuparambil324@gmail.com',
  },
]
