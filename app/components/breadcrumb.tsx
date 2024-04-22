"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { capitalize } from "../_helpers/_string";

export default function Breadcrumb2() {
  const path = usePathname();

  const pathNames = path.split("/").filter((path) => path);

  pathNames.unshift("home");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathNames.map((path, index) => {
          return (
            <>
              <BreadcrumbItem key={index} className={"pr-2 text-black"}>
                <BreadcrumbLink href={path === "home" ? "/" : path}>
                  {capitalize(path)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator key={index} />
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
