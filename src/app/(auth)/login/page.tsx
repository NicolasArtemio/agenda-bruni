import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectTo } from "@/lib/redirect";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginForm redirectTo={safeRedirectTo(params.next)} />;
}
