import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Delegation } from "../../../../../../model/interfaces";
import { useApi } from "../../../../../../contexts/apiContext";
import { useCommittee } from "../../../../contexts/committeeContext";
import { useParams } from "react-router-dom";

function DelegationNotInCommittee({
  delegation,
  onAdd,
}: {
  delegation: Delegation;
  onAdd: (delegation: Delegation) => void;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: "0" }}>
      <Typography sx={{ flex: "1" }}>{delegation.delegation_name}</Typography>
      <Button onClick={() => onAdd(delegation)}>Add</Button>
    </Box>
  );
}

function DelegationInCommittee({
  delegation,
  onRemove,
}: {
  delegation: Delegation;
  onRemove: (delegation: Delegation) => void;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: "0" }}>
      <Typography sx={{ flex: "1" }}>{delegation.delegation_name}</Typography>
      <Button onClick={() => onRemove(delegation)}>Remove</Button>
    </Box>
  );
}

export default function EditDelegations() {
  const { id } = useParams();

  const { axiosInstance } = useApi();

  const { committee, refreshCommittee } = useCommittee();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [delegationsNotInCommittee, setDelegationsNotInCommittee] = useState<
    Delegation[]
  >([]);
  const [delegationsInCommittee, setDelegationsInCommittee] = useState<
    Delegation[]
  >([]);

  const [delegationsLoading, setDelegationsLoading] = useState(false);

  const [notInDelegationSearch, setNotInDelegationSearch] =
    useState<string>("");
  const [inDelegationSearch, setInDelegationSearch] = useState<string>("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dialogOpen && delegationsNotInCommittee.length === 0) {
      setDelegationsLoading(true);
      axiosInstance.get("/delegations").then((response) => {
        setDelegationsLoading(false);
        const allDelegations: Delegation[] = response.data;
        setDelegationsNotInCommittee(
          allDelegations.filter((d) => !committee?.delegations.includes(d)),
        );
        setDelegationsInCommittee(
          committee?.delegations ? committee.delegations : [],
        );
      });
    }
  }, [dialogOpen, committee]);

  function removeDelegation(delegation: Delegation) {
    setDelegationsInCommittee(
      delegationsInCommittee.filter((d) => d !== delegation),
    );
    setDelegationsNotInCommittee([...delegationsNotInCommittee, delegation]);
  }

  function addDelegation(delegation: Delegation) {
    setDelegationsNotInCommittee(
      delegationsNotInCommittee.filter((d) => d !== delegation),
    );
    setDelegationsInCommittee([...delegationsInCommittee, delegation]);
  }

  function onSaveChanges() {
    setSaving(true);
    axiosInstance
      .patch(
        `/committees/${id}/participants`,
        delegationsInCommittee.map((d) => d.delegation_id),
      )
      .then(() => {
        refreshCommittee();
        setSaving(false);
        onCancel();
      });
  }

  function onCancel() {
    setDialogOpen(false);
    setDelegationsInCommittee([]);
    setDelegationsNotInCommittee([]);
  }

  return (
    <>
      {dialogOpen ? (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Edit Committee Delegations</DialogTitle>
          <DialogContent>
            {delegationsLoading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ overflow: "none", overflowY: "none" }}>
                <Typography variant="h5">Delegations in Committee</Typography>
                <List sx={{}}>
                  <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={inDelegationSearch}
                    onChange={(e) => setInDelegationSearch(e.target.value)}
                  />
                  {delegationsInCommittee.map((d) =>
                    d.delegation_name.startsWith(inDelegationSearch) ? (
                      <ListItem
                        key={d.delegation_id}
                        divider
                        sx={{ pl: "0", pr: "0" }}
                      >
                        <DelegationInCommittee
                          delegation={d}
                          onRemove={removeDelegation}
                        />
                      </ListItem>
                    ) : null,
                  )}
                </List>
                <Typography variant="h5">
                  Delegations not in Committee
                </Typography>
                <List sx={{}}>
                  <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={notInDelegationSearch}
                    onChange={(e) => setNotInDelegationSearch(e.target.value)}
                  />
                  {delegationsNotInCommittee.map((d) =>
                    d.delegation_name.startsWith(notInDelegationSearch) ? (
                      <ListItem
                        key={d.delegation_id}
                        divider
                        sx={{ pl: "0", pr: "0" }}
                      >
                        <DelegationNotInCommittee
                          delegation={d}
                          onAdd={addDelegation}
                        />
                      </ListItem>
                    ) : null,
                  )}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ display: "flex" }}>
            {saving ? (
              <CircularProgress />
            ) : (
              <Button
                sx={{ flex: "1" }}
                variant="contained"
                onClick={onSaveChanges}
              >
                Save Changes
              </Button>
            )}
            <Button onClick={onCancel}>Cancel Changes</Button>
          </DialogActions>
        </Dialog>
      ) : null}
      <Button
        variant="contained"
        sx={{ flex: 1, margin: 1 }}
        onClick={() => setDialogOpen(true)}
      >
        Edit Delegations in Committee
      </Button>
    </>
  );
}
