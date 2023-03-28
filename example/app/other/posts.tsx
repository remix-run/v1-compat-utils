import { Outlet } from "@remix-run/react";

export default function () {
  return (
    <div style={{ border: "2px solid red" }}>
      <Outlet />
    </div>
  );
}
