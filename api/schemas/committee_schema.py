from pydantic import BaseModel
from schemas.delegation_schema import Delegation
from schemas.workingpaper_schema import WorkingPaper

from models.models import CommitteePollingTypes, CommitteeSessionTypes

class CommitteeBase(BaseModel):
    committee_name: str
    committee_abbreviation: str


class CommitteeCreate(CommitteeBase):
    pass


class CommitteeUpdate(CommitteeBase):
    committee_id: int
    committee_announcement: str = ""
    committee_description: str = ""
    committee_status: CommitteeSessionTypes = CommitteeSessionTypes.OUT_OF_SESSION
    committee_poll: CommitteePollingTypes = CommitteePollingTypes.NONE
    speaker_list_open: bool = False


class Committee(CommitteeBase):
    committee_id: int

    # default values
    committee_announcement: str = ""
    committee_description: str = "No description."
    committee_status: CommitteeSessionTypes = CommitteeSessionTypes.OUT_OF_SESSION
    committee_poll: CommitteePollingTypes = CommitteePollingTypes.NONE
    speaker_list_open: bool = False

    delegations: list[Delegation] = []
    working_papers: list[WorkingPaper] = []

    class Config:
        from_attributes = True
