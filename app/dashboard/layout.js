import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import { headers } from 'next/headers';
import User from "@/models/User";
import connectMongo from "@/libs/mongoose";
import Message from "@/models/Message";

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

  await connectMongo();
  const user = await User.findById(session.user.id);

  // Verificar límites según el plan
  let conversationLimit = 1; // Plan gratuito por defecto
  let currentPlan = "Manantial";

  if (user.subscriptionStatus === 'active') {
    if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      conversationLimit = 15; // Plan Río
      currentPlan = "Río";
    } else if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID) {
      conversationLimit = 100; // Plan Oceano
      currentPlan = "Oceano";
    }
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
            {!isRootDashboard && (
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
            )}
            {/* <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Mis Conversaciones
            </h1> */}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Plan actual:</span>{' '}
              <span className="font-medium text-gray-900">{currentPlan}</span>
              {user.subscriptionStatus === 'active' && (
                <Link 
                  href="/dashboard/billing"
                  className="ml-2 text-[#25D366] hover:text-[#128C7E] font-medium"
                >
                  Gestionar suscripción
                </Link>
              )}
            </div>
            <ButtonAccount />
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}

// Exportar los límites para que estén disponibles en las páginas del dashboard
export const getSubscriptionLimits = async (userId) => {
  await connectMongo();
  const user = await User.findById(userId);
  const count = await Message.countDocuments({ userId });
  
  let conversationLimit = 1; // Plan gratuito
  
  if (user.subscriptionStatus === 'active') {
    if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      conversationLimit = 15;
    } else if (user.subscriptionPriceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID) {
      conversationLimit = 100;
    }
  }
  
  return {
    conversationLimit,
    currentCount: count
  };
};
