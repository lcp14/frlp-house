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
import React from "react";

export default function Breadcrumb2() {
  const path = usePathname();

  const pathNames = path.split("/").filter((path) => path);

  pathNames.unshift("home");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathNames.map((path, index) => {
          return (
            <React.Fragment key={path}>
              <BreadcrumbItem key={path + index} className={"pr-2 text-black"}>
                <BreadcrumbLink href={path === "home" ? "/" : path}>
                  {capitalize(path)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathNames.length !== index + 1 && (
                <BreadcrumbSeparator key={"sep" + path} />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
