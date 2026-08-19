import type { PropsWithChildren } from "react";

const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <main>{children}</main>;
};

export default AppLayout;
