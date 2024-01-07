import Announcements from "./components/announcements";
import Attendance from "./components/attendance";
import SpeakersList from "./components/speakersList";
import Voting from "./components/voting";
import WorkingPapers from "./components/workingPapers";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHeader } from "../../contexts/headerContext";
import ErrorModal from "../error";
import { Box, CircularProgress } from "@mui/material";
import { useApi } from "../../contexts/apiContext";
import AdminControls from "./components/adminControls";
import { CommitteeProvider, useCommittee } from "./contexts/committeeContext";
import Widget from "../shared/widget";
import { CommitteePollingType } from "../../model/interfaces";
import SelectDelegation from "./components/selectDelegation";

function CommitteeLayout() {
  // Contexts
  const { isLoggedIn } = useApi();
  const { committee, loading } = useCommittee();
  const setHeader = useHeader()[1];

  const [errorOpen, setErrorOpen] = useState<boolean>(false);

  // Update page header
  useEffect(
    () => setHeader(committee ? committee.committee_name : ""),
    [committee],
  );

  return (
    <>
      <ErrorModal
        open={errorOpen}
        message={"as"}
        onClose={() => setErrorOpen(false)}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box>{isLoggedIn ? <AdminControls /> : null}</Box>
            <Box sx={{ flex: "1", display: "flex", maxHeight: "75%" }}>
              <Box sx={{ flexBasis: "30%" }}>
                <Widget title="My Delegation">
                  <SelectDelegation />
                </Widget>
                {committee.committee_poll === CommitteePollingType.VOTING ? (
                  <Voting />
                ) : null}
                {committee.committee_poll ===
                CommitteePollingType.ATTENDANCE ? (
                  <Attendance />
                ) : null}
                <SpeakersList />
              </Box>
              <Box
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Announcements />
                <Widget title="Publications">
                  <p>Not yet implemented :(</p>
                </Widget>
                <WorkingPapers />
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

export default function CommitteeHub() {
  const { id } = useParams();

  return (
    <CommitteeProvider committee_id={id}>
      <CommitteeLayout />
    </CommitteeProvider>
  );
}
