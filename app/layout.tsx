import "./globals.css";

export const metadata = {
  title: "SpeakJournal",
  description: "Speaking practice journal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
