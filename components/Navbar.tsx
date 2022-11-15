import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

interface Route {
  href: string;
  label: string;
}

const routes: Route[] = [
  {
    href: "/",
    label: "Part 1",
  },
  {
    href: "/part-2",
    label: "Part 2",
  },
];

export const Navbar: FC = () => {
  return (
    <nav className="w-full p-6 border-b flex items-center justify-center space-x-6">
      {routes.map((route) => (
        <NavItem key={route.href} route={route} />
      ))}
    </nav>
  );
};

const NavItem: FC<{ route: Route }> = ({ route }) => {
  const router = useRouter();

  const isSelected =
    route.href == "/"
      ? router.asPath === "/"
      : router.asPath.startsWith(route.href);

  return (
    <Link
      href={route.href}
      className={`text-sm px-3 py-2 rounded-md hover:text-purple-600 ${
        isSelected && "text-purple-600 bg-purple-100"
      }`}
    >
      {route.label}
    </Link>
  );
};
