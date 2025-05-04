import React from "react";
import { Link } from "wouter";

export const Logo: React.FC = () => {
  return (
    <Link href="/">
      <img src="/logo.png" alt="First Logo" className="h-10 w-10" />
    </Link>
  );
};
