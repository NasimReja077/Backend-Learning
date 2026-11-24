import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  { className = "", ...props },
  ref
) {
  return (
    <textarea
      className={`ui-textarea ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});

export default Textarea;
