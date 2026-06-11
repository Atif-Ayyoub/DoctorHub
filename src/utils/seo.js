import { SITE_URL } from '../components/common/SEO';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'Doctor Hub',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  areaServed: {
    '@type': 'Country',
    name: 'Pakistan',
  },
  description: 'Doctor Hub is an online healthcare appointment platform for patients, doctors, clinics, prescriptions, and medical history management.',
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Doctor Hub',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/doctors?disease={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const breadcrumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

const privateMeta = {
  noindex: true,
  description: 'Secure Doctor Hub account area for managing healthcare appointments, prescriptions, messages, and patient records.',
};

const routeSeo = [
  {
    match: (path) => path === '/',
    meta: {
      title: 'Doctor Hub | Find Doctors & Book Appointments Online',
      description: 'Find doctors in Pakistan, book appointments online, manage prescriptions, share medical history, and connect with clinics on Doctor Hub.',
      path: '/',
      jsonLd: [organization, website],
    },
  },
  {
    match: (path) => path === '/doctors',
    meta: {
      title: 'Find Doctors by Disease & Treatment Type | Doctor Hub',
      description: 'Search verified doctors in Pakistan by disease, specialisation, treatment type, clinic location, experience, and consultation fee.',
      path: '/doctors',
      jsonLd: breadcrumb([{ name: 'Home', path: '/' }, { name: 'Find Doctors', path: '/doctors' }]),
    },
  },
  {
    match: (path) => /^\/doctors\/[^/]+\/book$/.test(path),
    meta: {
      title: 'Book Online Doctor Appointment | Doctor Hub',
      description: 'Book a doctor appointment online, choose clinic schedules, upload payment proof, and manage healthcare visits through Doctor Hub.',
      path: '/doctors',
    },
  },
  {
    match: (path) => /^\/doctors\/[^/]+$/.test(path),
    meta: {
      title: 'Doctor Profile & Online Appointment Booking | Doctor Hub',
      description: 'View doctor specialisation, treatment type, clinic locations, consultation fee, availability, and book appointments online.',
      path: '/doctors',
    },
  },
  {
    match: (path) => path === '/login',
    meta: {
      title: 'Login to Patient & Doctor Portal | Doctor Hub',
      description: 'Sign in to Doctor Hub to manage appointments, prescriptions, medical history, doctor schedules, payments, and messages securely.',
      path: '/login',
      noindex: true,
    },
  },
  {
    match: (path) => path === '/register',
    meta: {
      title: 'Create Patient Account & Book Doctors Online | Doctor Hub',
      description: 'Register on Doctor Hub to find doctors, book online appointments, upload payments, and manage your healthcare records.',
      path: '/register',
    },
  },
  {
    match: (path) => path === '/forgot-password',
    meta: {
      title: 'Reset Password | Doctor Hub',
      description: 'Reset your Doctor Hub password to regain access to appointments, prescriptions, medical history, and healthcare messages.',
      path: '/forgot-password',
      noindex: true,
    },
  },
  {
    match: (path) => path === '/patient',
    meta: {
      title: 'Patient Dashboard | Appointments & Medical Records | Doctor Hub',
      path: '/patient',
      ...privateMeta,
    },
  },
  {
    match: (path) => path === '/patient/appointments',
    meta: {
      title: 'Patient Appointments | Doctor Hub',
      path: '/patient/appointments',
      ...privateMeta,
    },
  },
  {
    match: (path) => path === '/patient/book',
    meta: {
      title: 'Book Online Doctor Appointment | Doctor Hub',
      path: '/patient/book',
      ...privateMeta,
    },
  },
  {
    match: (path) => path === '/patient/history',
    meta: {
      title: 'Medical History Management | Doctor Hub',
      description: 'Manage patient medical history online, upload reports, and share health records securely with authorized doctors.',
      path: '/patient/history',
      noindex: true,
    },
  },
  {
    match: (path) => path === '/patient/prescriptions',
    meta: {
      title: 'Prescription History & Records | Doctor Hub',
      description: 'View doctor prescriptions online and keep patient prescription history organized inside the Doctor Hub patient portal.',
      path: '/patient/prescriptions',
      noindex: true,
    },
  },
  {
    match: (path) => path === '/doctor',
    meta: {
      title: 'Doctor Dashboard | Clinic, Schedule & Appointment Management | Doctor Hub',
      description: 'Doctor Hub helps doctors manage clinics, schedules, appointments, assistants, prescriptions, patient messages, and profiles.',
      path: '/doctor',
      noindex: true,
    },
  },
  {
    match: (path) => path.startsWith('/assistant') || path.startsWith('/admin') || path.startsWith('/superadmin') || path.startsWith('/notifications'),
    meta: {
      title: 'Secure Dashboard | Doctor Hub',
      path: '/',
      ...privateMeta,
    },
  },
];

export function getSeoForPath(pathname) {
  return routeSeo.find((entry) => entry.match(pathname))?.meta || {
    title: 'Doctor Hub | Online Healthcare Appointment Platform',
    description: 'Doctor Hub is an online healthcare appointment system for doctors, patients, clinics, prescriptions, and medical history management.',
    path: pathname,
  };
}

export { breadcrumb, organization, website };
