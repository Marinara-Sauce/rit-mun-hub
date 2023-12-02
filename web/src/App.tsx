import AppHeader from "./components/header/header";
import AppFooter from "./components/footer/footer";
import CommitteeHub from "./components/committee/committeePage";
import { Route, Routes } from "react-router-dom";
import { HeaderProvider } from "./contexts/headerContext";
import SelectCommittee from "./components/committee/components/selectCommittee/selectCommittee";
import SelectDelegation from "./components/delegation/components/selectDelegation/selectDelegation";
import DelegationPage from "./components/delegation/delegationPage";
import { Box } from "@mui/material";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
      <AuthProvider>
        <HeaderProvider>
          <Box sx={{display: "flex", flexDirection: "column", height: "100vh", flex: "1"}}>
            <AppHeader />
            <Box sx={{ overflow: "auto", display: "flex", flexDirection: "column", height: "100vh" }}>
              <Routes>
                <Route path="/committee" Component={SelectCommittee} />
                <Route path="/committee/:id" Component={CommitteeHub} />
                <Route path="/delegation" Component={SelectDelegation} />
                <Route path="/delegation/:id" Component={DelegationPage} />
              </Routes>
            </Box>
            <AppFooter />
          </Box>
        </HeaderProvider>
      </AuthProvider>
  );
}

export default App;
