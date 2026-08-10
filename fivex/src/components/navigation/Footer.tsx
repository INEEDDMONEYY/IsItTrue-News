import { Link } from 'react-router-dom'
import logo from '@/assets/icons/question-icon-removebg.png'

const FOOTER_COLUMNS = [
  {
    title: 'Sections',
    links: [
      { label: 'Politics', to: '/category/politics' },
      { label: 'World', to: '/category/world' },
      { label: 'Technology', to: '/category/technology' },
      { label: 'Business', to: '/category/business' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Submit Ticket', to: '/submit-ticket' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Corrections Policy', to: '/corrections-policy' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img
              src={logo}
              alt="IsItTrue"
              className="h-8 w-auto rounded-md bg-white/95 px-2 py-1"
            />
            <span className="font-semibold text-heading">IsItTrue News</span>
          </Link>
          <p className="text-sm text-text-dim leading-relaxed">
            Verified news, checked sources, no noise.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-medium text-heading mb-3">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-dim hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 text-xs text-text-dim">
          © {new Date().getFullYear()} IsItTrue. All rights reserved.
        </div>
      </div>
    </footer>
  )
}