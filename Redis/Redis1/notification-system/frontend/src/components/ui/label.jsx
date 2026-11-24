import { forwardRef } from "react";

const Label = forwardRef(function Label({ className = "", ...props }, ref) {
  return (
    <label
      className={`ui-label ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});

export default Label;
