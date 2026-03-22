import { handleLogout } from "@/utils/helper";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleLogout}
      className="w-full"
    >
      <LogOut size={20} />
      Logout
    </Button>
  );
};

export default LogoutButton;
