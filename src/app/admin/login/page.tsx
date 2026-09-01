import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <section className="bg-muted/30 flex min-h-screen items-center justify-center px-4">
      <div className="border-border bg-surface w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <Logo height={44} className="mb-8" />
        <h1 className="font-display text-2xl">Вход в панель управления</h1>
        <p className="text-muted-foreground mt-1 text-sm">Только для администраторов</p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </section>
  );
}
