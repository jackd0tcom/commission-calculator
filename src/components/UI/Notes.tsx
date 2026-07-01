import { useRef, useLayoutEffect } from "react";

interface props {
  value: string;
  onChange: any;
  setCount: any;
  count: number;
  updateNotes: any;
  saveNotesKeepalive: any;
}

const Notes = ({
  value,
  onChange,
  updateNotes,
  saveNotesKeepalive,
  count,
  setCount,
}: props) => {
  const saveTimer = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const isDirtyRef = useRef(false);
  const updateNotesRef = useRef(updateNotes);
  const saveNotesKeepaliveRef = useRef(saveNotesKeepalive);

  updateNotesRef.current = updateNotes;
  saveNotesKeepaliveRef.current = saveNotesKeepalive;

  if (count === 0) {
    isDirtyRef.current = false;
    valueRef.current = value;
  }

  const clearSaveTimer = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  };

  const flushNotes = () => {
    if (!isDirtyRef.current) return;
    isDirtyRef.current = false;
    updateNotesRef.current(valueRef.current);
  };

  const scheduleSave = () => {
    clearSaveTimer();
    saveTimer.current = setTimeout(flushNotes, 2000);
  };

  const handleChange = (e: any) => {
    const nextValue = e.target.value;
    valueRef.current = nextValue;
    isDirtyRef.current = true;
    onChange(nextValue);
    setCount((prevCount: number) => prevCount + 1);
    scheduleSave();
  };

  const handleBlur = () => {
    clearSaveTimer();
    flushNotes();
  };

  useLayoutEffect(() => {
    return () => {
      clearSaveTimer();
      if (!isDirtyRef.current) return;
      if (saveNotesKeepaliveRef.current) {
        saveNotesKeepaliveRef.current(valueRef.current);
      } else {
        updateNotesRef.current(valueRef.current);
      }
    };
  }, []);

  return (
    <textarea
      onChange={handleChange}
      name="notes"
      id=""
      className="order-notes"
      value={value}
      onBlur={handleBlur}
      placeholder="Notes"
    ></textarea>
  );
};

export default Notes;
