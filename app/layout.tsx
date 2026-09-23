import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Sovereign | Medical Store',
  description: 'Premium medical scrubs & gear for medical students in Egypt'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}