import {
  HomeIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Home, Orders, Products, Invoice, Register, Users } from "@/pages/dashboard";
import { SignIn, ForgotPassword} from "@/pages/auth";
import { AddNewProduct, InvoiceDetails, ViewOrder } from "@/pages/screen";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "products",
        path: "/products",
        element: <Products />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "orders",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "invoice",
        path: "/invoice",
        element: <Invoice />,
      },
      {
        icon: <InformationCircleIcon {...icon} />, // Changed the icon for register
        name: "register",
        path: "/register",
        element: <Register />,
      },
      {
        icon: <UserCircleIcon {...icon} />, // Use the UserCircleIcon for users
        name: "users",
        path: "/users",
        element: <Users />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "forgot-password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    layout: "screen",
    pages: [
      {
        name: "addnewproduct",
        path: "/addnewproduct",
        element: <AddNewProduct />,
      },
      {
        name: "invoicedetails",
        path: "/invoicedetails/:invoiceNumber",
        element: <InvoiceDetails />,
      },
      {
        name: "vieworder",
        path: "/vieworder",
        element: <ViewOrder />,
      },
    ],
  },
];

export default routes;
