import "./globals.css";
import { DeepgramContextProvider } from '../lib/contexts/DeepgramContext';
import { AuthProvider } from '../lib/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>
        <DeepgramContextProvider>
          <body>{children}</body>
        </DeepgramContextProvider>
      </AuthProvider>
    </html>
  );
}
