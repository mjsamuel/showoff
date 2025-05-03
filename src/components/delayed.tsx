import React, { useState, useEffect } from "react";

export default function Delayed({
  children,
  waitingContent,
  waitBeforeShow,
}: {
  children: React.ReactNode;
  waitingContent?: React.ReactNode;
  waitBeforeShow: number;
}) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsShown(true), waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : waitingContent;
}
