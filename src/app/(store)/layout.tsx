import Header from '@/components/layout/Header';
import QuoteDrawer from '@/components/store/QuoteDrawer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      <QuoteDrawer />
    </div>
  );
}
