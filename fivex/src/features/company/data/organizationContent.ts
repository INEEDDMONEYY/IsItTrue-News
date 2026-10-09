export const organizationContent = {
  hero: {
    eyebrow: "For Organizations",
    title: "Bring your organization into the conversation.",
    description:
      "IITNews gives organizations a structured way to participate in journalism, manage access, and bring their teams together around the information that matters to them.",
    primaryAction: {
      label: "Get Started",
      href: "/organizations/signup",
    },
    secondaryAction: {
      label: "Compare Plans",
      href: "#plans",
    },
  },

  why: {
    eyebrow: "Why Organizations",
    title: "A better way for teams to engage with journalism.",
    description:
      "Organizations often need more than individual access. IITNews provides organization-level tools designed to help teams access information, collaborate, and manage their members.",
    items: [
      {
        title: "Centralize your organization",
        description:
          "Manage your organization's IITNews access from a central organization dashboard.",
        icon: "building-2",
      },
      {
        title: "Bring your team together",
        description:
          "Give multiple members access through organization seats rather than managing accounts individually.",
        icon: "users",
      },
      {
        title: "Choose the access you need",
        description:
          "Start with a single seat, expand to a small team, or choose unlimited seats as your organization grows.",
        icon: "sliders-horizontal",
      },
      {
        title: "Grow with IITNews",
        description:
          "Choose an organization plan that can support your team as your needs change.",
        icon: "trending-up",
      },
    ],
  },

  plans: {
    eyebrow: "Organization Plans",
    title: "Choose the plan that fits your organization.",
    description:
      "Start with the access your organization needs today and expand when your team is ready.",
    items: [
      {
        name: "Organization Starter",
        description:
          "A simple starting point for organizations that need basic organization access.",
        price: "Free",
        priceSuffix: "",
        seats: "2 seats",
        features: [
          "Organization Dashboard",
          "1 author seat",
          "1 editor seat",
        ],
        featured: false,
      },
      {
        name: "Small Organization",
        description:
          "Designed for small teams that need to give multiple members access.",
        price: "$7/month",
        priceSuffix: "",
        seats: "5 seats",
        features: [
          "Organization dashboard",
          "1 admin seat",
          "2 author seats",
          "2 editor seats",
        ],
        featured: true,
      },
      {
        name: "Organization Max",
        description:
          "For organizations that need flexible access for their entire team.",
        price: "$14/month",
        priceSuffix: "",
        seats: "10 seats",
        features: [
          "Organization Dashboard",
          "2 admin seats",
          "4 author seats",
          "4 editor seats",
        ],
        featured: false,
      },
    ],
  },

  seats: {
    eyebrow: "Organization Seats",
    title: "Give your team the access they need.",
    description:
      "Organization seats determine how many members can access your organization's IITNews account.",
    items: [
      {
        value: "1",
        label: "Starter Seat",
        description:
          "One seat for organizations beginning with a single member.",
      },
      {
        value: "5",
        label: "Small Organization",
        description:
          "Five seats for organizations that need access for a small team.",
      },
      {
        value: "10",
        label: "Organization Max",
        description:
          "Ten seats for organizations that need broader team access.",
      },
    ],
  },

  benefits: {
    eyebrow: "Organization Benefits",
    title: "Built for organizations, not just individual accounts.",
    description:
      "Organization plans provide a foundation for managing access across your team while giving IITNews room to support your organization's evolving needs.",
    items: [
      {
        title: "Organization Dashboard",
        description:
          "Manage your organization's account and access from a centralized dashboard.",
        icon: "layout-dashboard",
      },
      {
        title: "Team Access",
        description:
          "Give multiple members access through organization seats.",
        icon: "users",
      },
      {
        title: "Simple Management",
        description:
          "Keep organization access structured instead of managing every member separately.",
        icon: "settings-2",
      },
      {
        title: "Flexible Growth",
        description:
          "Move from a single seat to a larger team or unlimited access as your organization grows.",
        icon: "arrow-up-right",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How It Works",
    title: "Get your organization set up in a few steps.",
    description:
      "Choose a plan, establish your organization, and begin managing access for your team.",
    steps: [
      {
        number: "01",
        title: "Choose a Plan",
        description:
          "Select the organization plan that matches the size and needs of your team.",
      },
      {
        number: "02",
        title: "Create Your Organization",
        description:
          "Set up your organization and establish the account that will manage your team's access.",
      },
      {
        number: "03",
        title: "Manage Seats",
        description:
          "Use your organization tools to manage the members who have access to your organization's plan.",
      },
      {
        number: "04",
        title: "Bring Your Team In",
        description:
          "Give your organization's members access according to the seats available on your plan.",
      },
    ],
  },

  faq: {
    eyebrow: "Frequently Asked Questions",
    title: "Questions about organization plans?",
    description:
      "Here are some common questions about organization accounts, plans, and seats.",
    items: [
      {
        question: "What is an organization account?",
        answer:
          "An organization account provides a way for a team or organization to manage IITNews access collectively rather than managing each member entirely as an individual account.",
      },
      {
        question: "How many seats does each plan include?",
        answer:
          "Organization Starter includes 1 seat, Small Organization includes 5 seats, and Organization Unlimited includes unlimited seats.",
      },
      {
        question: "Can I add more seats to Organization Starter?",
        answer:
          "Organization Starter is designed for 1 seat. Organizations that need additional seats can choose a plan with broader team access.",
      },
      {
        question: "What does the Small Organization plan include?",
        answer:
          "Small Organization includes everything in Organization Starter plus 4 additional seats, for a total of 5 seats.",
      },
      {
        question: "What does unlimited mean?",
        answer:
          "Organization Unlimited provides unlimited organization seats, allowing an organization to provide access to its team without a fixed seat limit.",
      },
      {
        question: "Can my organization change plans?",
        answer:
          "Organization plan changes can be supported as your organization's access needs change. Specific upgrade, downgrade, and billing rules will be provided as the organization system is finalized.",
      },
      {
        question: "Who can manage organization members?",
        answer:
          "Organization management and member permissions will be handled through the organization account and its available administrative controls.",
      },
    ],
  },

  cta: {
    eyebrow: "For Your Organization",
    title: "Give your team a place on IITNews.",
    description:
      "Choose an organization plan that fits your team and bring your members together around the journalism and information that matters.",
    action: {
      label: "Get Started",
      href: "/organizations/signup",
    },
  },
};