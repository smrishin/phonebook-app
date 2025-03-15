import "./globals.css";

import AuthWrapper from "../components/AuthWrapper";
import Header from "../components/Header";
import LoadingProvider from "../components/LoadingProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <AuthWrapper>
            <Header />
            <div className="mt-16">
              {" "}
              <main className="container mx-auto p-4">{children}</main>
            </div>
          </AuthWrapper>
        </LoadingProvider>
      </body>
    </html>
  );
}
