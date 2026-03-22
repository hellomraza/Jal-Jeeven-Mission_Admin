import DashboardLayout from "@/components/layout/dashboard-layout";

const PrivateLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default PrivateLayout;
