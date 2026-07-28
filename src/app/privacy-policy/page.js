import LegalPage from "@/Components/Common/LegalPage/LegalPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy | Sehat Potli",
};

export default function PrivacyPolicyPage() {
  return <LegalPage slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
