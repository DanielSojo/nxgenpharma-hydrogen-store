import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import QuoteDrawer from '@/components/store/QuoteDrawer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-surface">
      <Header />
      <main>{children}</main>
      <Footer />
      <QuoteDrawer />
    </div>
  );
}
