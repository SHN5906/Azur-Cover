import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-2xl font-semibold">Accès refusé.</h1>
      <p className="mt-4 text-muted">Cet email n&apos;est pas autorisé sur /admin.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Retour au site
      </Link>
    </main>
  );
}
