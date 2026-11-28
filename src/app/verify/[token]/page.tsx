import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { verifyPublicQrToken } from "@/app/actions/academics-finance.actions";

export const metadata: Metadata = {
  title: "Document QR Verification | EduCore",
  robots: { index: false, follow: false },
};

export default async function VerifyDocumentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await verifyPublicQrToken(token);
  const schoolObj = record ? (Array.isArray(record.schools) ? record.schools[0] : record.schools) : null;
  const summary =
    record?.summary && typeof record.summary === "object" && !Array.isArray(record.summary)
      ? (record.summary as Record<string, string>)
      : {};

  const isValid = Boolean(record && !record.revoked_at);

  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto w-full py-12 px-4">
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-ink">Document Authenticity Check</h1>
            <StatusBadge tone={isValid ? "success" : "danger"}>
              {isValid ? "Verified Valid" : record?.revoked_at ? "Revoked" : "Invalid Token"}
            </StatusBadge>
          </div>

          {record ? (
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <div>
                <strong>Issuing Institution:</strong> {schoolObj?.name ?? "Verified School"} ({schoolObj?.school_code ?? "—"})
              </div>
              <div>
                <strong>Document Type:</strong> {record.doc_type.replace("_", " ").toUpperCase()}
              </div>
              <div>
                <strong>Reference Code:</strong> <span className="font-mono">{record.reference_code}</span>
              </div>
              {Object.entries(summary).map(([k, v]) => (
                <div key={k}>
                  <strong className="capitalize">{k.replace(/([A-Z])/g, " $1")}:</strong> {String(v)}
                </div>
              ))}
              {record.revoked_at ? (
                <p className="text-danger font-medium pt-2">
                  This document verification token was revoked by the school administration on{" "}
                  {new Date(record.revoked_at).toLocaleDateString("en-IN")}.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">
              No active report card, ID card, or certificate matches this verification QR token.
            </p>
          )}

          <div>
            <Link href="/">
              <Button variant="outline">Back to Portal Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
}
