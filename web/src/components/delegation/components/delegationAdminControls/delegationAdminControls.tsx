import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useApi } from "../../../../contexts/authContext";
import { useState } from "react";
import CreateDelegation from "./createDelegation/createDelegation";
import EditDelegations from "./editDelegations/editDelegations";

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
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <CreateDelegation />
                        <EditDelegations />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button>Close</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setDialogOpen(true)}>Manage Delegations</Button>
        </>
    );
}