import { useState, useEffect, useCallback } from "react";

export const useContextMenu = () => {
  const [xPos, setXPos] = useState("0px");
  const [yPos, setYPos] = useState("0px");
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = useCallback((e: any) => {
    e.preventDefault();
    setXPos(`${e.pageX}px`);
    setYPos(`${e.pageY}px`);
    setShowMenu(true);
  }, []);

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [handleClick]);

  return { xPos, yPos, showMenu, handleContextMenu };
};
