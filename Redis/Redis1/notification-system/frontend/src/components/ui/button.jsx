import { forwardRef } from "react";

const Button = forwardRef(function Button(
  { className = "", variant = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      ref={ref}
      type={type}
      {...props}
    />
  );
});

export default Button;
