"use client";

import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const path = usePathname();

  const pathNames = path.split("/").filter((path) => path);

  pathNames.unshift("home");

  return (
    <div className="w-full border-b-2 pb-2 text-xs">
      {pathNames.map((path, index) => {
        return (
          <span key={path} className={"pr-2 text-black"}>
            {pathNames.length === index + 1 ? (
              <span className="text-red-500"> {path.toUpperCase()} </span>
            ) : (
              <span> {path.toUpperCase()} </span>
            )}
            /
          </span>
        );
      })}
    </div>
  );
}
