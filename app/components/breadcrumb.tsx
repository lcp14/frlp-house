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

    // <div className="w-full border-b-2 pb-2 text-xs">
    //   {pathNames.map((path, index) => {
    //     return (
    //       <span key={path} className={"pr-2 text-black"}>
    //         {pathNames.length === index + 1 ? (
    //           <span className="text-red-500"> {path.toUpperCase()} </span>
    //         ) : (
    //           <span> {path.toUpperCase()} </span>
    //         )}
    //         /
    //       </span>
    //     );
    //   })}
    // </div>
  );
}
