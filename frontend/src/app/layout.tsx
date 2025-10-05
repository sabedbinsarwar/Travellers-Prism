import "./globals.css";
import ConditionalNavbar from "../components/ConditionalNavbar";

export const metadata = {
  title: "Traveller's Prism",
  description: "Connect with travellers, share adventures, join events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
