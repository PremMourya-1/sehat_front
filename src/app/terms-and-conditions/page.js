import LegalPage from "@/Components/Common/LegalPage/LegalPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions | Sehat Potli",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />
  );
}
