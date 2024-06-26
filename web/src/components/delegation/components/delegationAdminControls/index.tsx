import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useApi } from "../../../../contexts/apiContext";
import { useState } from "react";
import EditDelegations from "./editDelegations";

export default function DelegationAdminControls() {
  const { isLoggedIn } = useApi();

  const [dialogOpen, setDialogOpen] = useState(false);

  function closeDialog() {
    setDialogOpen(false);
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Manage Delegations</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <EditDelegations />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button>Close</Button>
        </DialogActions>
      </Dialog>
      <Button color="inherit" onClick={() => setDialogOpen(true)}>Manage Delegations</Button>
    </>
  );
}
