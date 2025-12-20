import {
  IntroPage,
  CapabilitiesPage,
  FeaturesPage,
} from "./pages";

export const ONBOARDING_PAGES = [
  { key: "intro", render: () => <IntroPage /> },
  { key: "capabilities", render: () => <CapabilitiesPage /> },
  { key: "features", render: () => <FeaturesPage /> },
];
