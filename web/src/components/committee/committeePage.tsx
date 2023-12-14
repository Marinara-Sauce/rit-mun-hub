import Announcements from "./components/announcements/announcements";
import Attendance from "./components/attendance/attendance";
import SpeakersList from "./components/speakers-list/speakers-list";
import Voting from "./components/voting/voting";
import WorkingPapers from "./components/working-papers/workingPapers";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHeader } from "../../contexts/headerContext";
import ErrorModal from "../error/errorModal";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/authContext";
import AdminControls from "./components/adminControls/adminControls";
import { CommitteeProvider, useCommittee } from "./contexts/committeeContext";
import Widget from "../widget/widget";

function CommitteeLayout() {
  const { id } = useParams();

  // Contexts
  const authed = useAuth()[1];
  const { committee, loading } = useCommittee();
  const setHeader = useHeader()[1];

  // Committee States
  const [procedure, setProcedure] = useState<number>(1);
  const [errorOpen, setErrorOpen] = useState<boolean>(false);

  // Connect to websocket for polling
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/committees/${id}/ws`);

    socket.onopen = () => {
      console.log("Websocket is open");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProcedure(data);
    };

    const heartbeatInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("heartbeat");
      }
    }, 1000);

    socket.onclose = () => {
      clearInterval(heartbeatInterval);
    };

    return () => socket.close();
  });

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
          <Box sx={{ display: "flex", flexDirection: "column"}}>
            <Box>{authed ? <AdminControls /> : null}</Box>
            <Box sx={{ flex: "1", display: "flex", maxHeight: "75%" }}>
              <Box sx={{ flexBasis: "30%" }}>
                <Widget title="My Delegation">
                  <p>Not Yet Implemented :(</p>
                </Widget>
                {procedure === 2 ? <Voting /> : null}
                {procedure === 3 ? <Attendance /> : null}
                <SpeakersList />
              </Box>
              <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
