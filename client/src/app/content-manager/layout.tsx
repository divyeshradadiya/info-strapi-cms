export default function ContentManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="content-manager-layout">
      {children}
    </div>
  );
}
