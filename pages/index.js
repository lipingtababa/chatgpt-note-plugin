import React from 'react';

export default function Page() {
  // return link to todos page
  return React.createElement("a", { href: "/api/todos" }, "My Todo List");
  }