import LegalPage from "@/Components/Common/LegalPage/LegalPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refund Policy | Sehat Potli",
};

export default function RefundPolicyPage() {
  return <LegalPage slug="refund-policy" fallbackTitle="Refund Policy" />;
}
