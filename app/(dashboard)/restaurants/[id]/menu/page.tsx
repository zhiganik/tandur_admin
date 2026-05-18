import { Suspense } from 'react';
import MenuPage from './MenuPage';

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return (
    <Suspense>
      <MenuPage />
    </Suspense>
  );
}
