import { Button, CircularProgress } from "@mui/material";
import { MouseEventHandler } from "react";

export default function LoadingButton({
  loading,
  variant = "contained",
  color,
  onClick,
  children,
}: {
  loading: boolean;
  variant?: "contained" | "text" | "outlined";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: string;
}) {
  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <Button variant={variant} color={color} onClick={onClick}>
          {children}
        </Button>
      )}
    </>
  );
}