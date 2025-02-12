import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import { headers } from 'next/headers';

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Obtener la ruta actual desde el servidor
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  console.log(pathname);
  const isRootDashboard = pathname === "/dashboard";

  return (
    <main className="min-h-screen p-8 pb-24 bg-gray-50">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* {!isRootDashboard && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </Link>
            )} */}
            {/* <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Mis Conversaciones
            </h1> */}
          </div>
          <ButtonAccount />
        </div>
        {children}
      </section>
    </main>
  );
}
