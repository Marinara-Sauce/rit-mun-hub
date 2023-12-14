import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useCommittee } from "../../../contexts/committeeContext";
import { CommitteePollingType } from "../../../../../model/committee";
import LoadingButton from "../../../../shared/loadingButton/loadingButton";

export default function AttendanceProcedureControls() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { committee, setCommitteePoll } = useCommittee();
  const [loading, setLoading] = useState(false);

  const [inAttendance, setInAttendance] = useState<boolean>(
    committee.committee_poll === CommitteePollingType.ATTENDANCE,
  );

  function toggleAttendance() {
    setLoading(true);
    setCommitteePoll(
      inAttendance
        ? CommitteePollingType.NONE
        : CommitteePollingType.ATTENDANCE,
      () => {
        setLoading(false);
        setInAttendance(!inAttendance);
      },
    );
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Attendance Procedure</DialogTitle>
        <DialogContent>
          {!inAttendance ? (
            <Typography>Attendance has not been opened yet</Typography>
          ) : (
            <Typography>Attendance in progress</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {inAttendance ? (
            <LoadingButton
              loading={loading}
              variant="contained"
              color="error"
              onClick={toggleAttendance}
            >
              End Attendance
            </LoadingButton>
          ) : (
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={toggleAttendance}
            >
              Start Attendance
            </LoadingButton>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="contained"
        sx={{ flex: 1, margin: 1 }}
        onClick={() => setDialogOpen(true)}
      >
        Attendance
      </Button>
    </>
  );
}