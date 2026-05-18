import { Suspense } from 'react';
import CategoriesPage from './CategoriesPage';

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return (
    <Suspense>
      <CategoriesPage />
    </Suspense>
  );
}
