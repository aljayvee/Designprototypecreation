import { createBrowserRouter } from "react-router";
import LoginPage from "./components/LoginPage";
import OwnerPortal from "./components/OwnerPortal";
import DispatcherPortal from "./components/DispatcherPortal";
import RiderPortal from "./components/RiderPortal";
import CustomerPortal from "./components/CustomerPortal";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/owner",
    Component: OwnerPortal,
  },
  {
    path: "/dispatcher",
    Component: DispatcherPortal,
  },
  {
    path: "/rider",
    Component: RiderPortal,
  },
  {
    path: "/customer",
    Component: CustomerPortal,
  },
]);
