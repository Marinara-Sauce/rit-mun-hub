from enum import IntEnum

from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, Enum, UniqueConstraint, func
from sqlalchemy.orm import relationship

from database.database import Base


class CommitteeSessionTypes(IntEnum):
    """
    Different types of committee sessions.
    """
    IN_SESSION = 1
    SUSPENDED_SESSION = 2
    OUT_OF_SESSION = 3
    UNMOD = 4
    MOD = 5


class CommitteePollingTypes(IntEnum):
    """
    Different types of polls that can be running on a committee
    """
    NONE = 1
    VOTING = 2
    ATTENDANCE = 3
    
    
class Vote(IntEnum):
    """
    A delegations vote
    """
    YES = 1
    NO = 2
    ABSTAIN = 3
    

class AttendanceEntryType(IntEnum):
    PRESENT = 1
    PRESENT_AND_VOTING = 2
    
    
class Participant(Base):
    __tablename__ = "participants"

    # ids
    participant_id = Column(Integer, primary_key=True, index=True, unique=True, autoincrement=True)

    # foreign ids
    delegation_id = Column(Integer, ForeignKey("delegations.delegation_id"))
    committee_id = Column(Integer, ForeignKey("committees.committee_id"))
    
    __table_args__ = (
        UniqueConstraint('delegation_id', 'committee_id', name='unique_delegation_committee'),
    )


class Committee(Base):
    __tablename__ = "committees"

    # id
    committee_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)

    # participants in delegation
    delegations = relationship("Delegation", secondary="participants")
    working_papers = relationship("WorkingPaper", back_populates="committee", cascade="all,delete")

    # data
    committee_name = Column(String)
    committee_abbreviation = Column(String)
    committee_description = Column(String, default="")
    committee_status = Column(Enum(CommitteeSessionTypes), default=CommitteeSessionTypes.OUT_OF_SESSION)
    committee_announcement = Column(String, default="")
    committee_poll = Column(Enum(CommitteePollingTypes), default=CommitteePollingTypes.NONE)
    speaker_list_open = Column(Boolean, default=False, nullable=False)


class VotingSession(Base):
    __tablename__ = "votingsessions"
    
    # id
    voting_session_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    
    # relationships
    committee_id = Column(Integer, ForeignKey("committees.committee_id"))
    
    # data
    live = Column(Boolean, default=True)
    open_time = Column(DateTime, server_default=func.now())
    close_time = Column(DateTime)

    votes = relationship("Votes", backref="votingsessions")
    
    def to_dict(self):
        return {
            "voting_session_id": self.voting_session_id,
            "committee_id": self.committee_id,
            "live": self.live,
            "open_time": self.open_time.isoformat() if self.open_time else None,
            "close_time": self.close_time.isoformat() if self.close_time else None,
            "votes": [vote.to_dict() for vote in self.votes] if self.votes else [],
        }

class Votes(Base):
    __tablename__ = "votes"
    
    # id
    vote_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    
    # relationships
    voting_session_id = Column(Integer, ForeignKey("votingsessions.voting_session_id"))
    delegation_id = Column(Integer, ForeignKey("delegations.delegation_id"))
    
    # data
    timestamp = Column(DateTime, server_default=func.now())
    vote = Column(Enum(Vote))
    
    def to_dict(self):
        return {
            "vote_id": self.vote_id,
            "voting_session_id": self.voting_session_id,
            "delegation_id": self.delegation_id,
            "timestamp": self.timestamp.isoformat(),
            "vote": self.vote.value
        }
        
class AttendanceSession(Base):
    __tablename__ = "attendancesessions"
    
    attendance_session_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    
    # relationships
    committee_id = Column(Integer, ForeignKey("committees.committee_id"))

    # data
    live = Column(Boolean, default=True)
    open_time = Column(DateTime, server_default=func.now())
    close_time = Column(DateTime)
    
    entries = relationship("AttendanceEntry", backref="attendanceentries")
    
    def to_dict(self):
        return {
            "attendance_session_id": self.attendance_session_id,
            "committee_id": self.committee_id,
            "live": self.live,
            "open_time": self.open_time.isoformat() if self.open_time else None,
            "close_time": self.close_time.isoformat() if self.close_time else None,
            "entries": [entries.to_dict() for entries in self.entries] if self.entries else [],
        }


class AttendanceEntry(Base):
    __tablename__ = "attendanceentries"
    
    attendance_entry_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    
    # foreign keys
    attendance_session_id = Column(Integer, ForeignKey("attendancesessions.attendance_session_id"))
    delegation_id = Column(Integer, ForeignKey("delegations.delegation_id"))
    
    # data
    timestamp = Column(DateTime, server_default=func.now())
    entry = Column(Enum(AttendanceEntryType))
    
    def to_dict(self):
        return {
            "attendance_entry_id": self.attendance_entry_id,
            "attendance_session_id": self.attendance_session_id,
            "delegation_id": self.delegation_id,
            "timestamp": self.timestamp.isoformat(),
            "entry": self.entry.value
        }


class Delegation(Base):
    __tablename__ = "delegations"

    # id
    delegation_id = Column(Integer, primary_key=True, index=True, unique=True, autoincrement=True)

    # data
    delegation_name = Column(String)


class SpeakerList(Base):
    __tablename__ = "speakerlist"

    # id
    speakerlist_id = Column(Integer, primary_key=True, index=True, unique=True, autoincrement=True)

    # foreign ids
    committee_id = Column(Integer, ForeignKey("committees.committee_id"))
    delegation_id = Column(Integer, ForeignKey("delegations.delegation_id"))

    # data
    spoke = Column(Boolean, nullable=False, default=False)
    timestamp = Column(DateTime, server_default=func.now())
    
    # relationships
    committee = relationship("Committee", backref="speakerlist")
    

class WorkingPaper(Base):
    __tablename__ = "workingpapers"

    # id
    working_paper_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)

    # foreign ids
    committee_id = Column(Integer, ForeignKey("committees.committee_id"))

    # relationships
    committee = relationship("Committee", back_populates="working_papers")
    delegations = relationship("Delegation", secondary="workingpaperdelegations")

    # data
    paper_link = Column(String)
    working_group_name = Column(String, unique=True)


class WorkingPaperDelegation(Base):
    __tablename__ = "workingpaperdelegations"

    # id
    working_paper_relationship_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)

    # foreign keys
    working_paper_id = Column(Integer, ForeignKey("workingpapers.working_paper_id"))
    delegation_id = Column(Integer, ForeignKey("delegations.delegation_id"))


class AdminUser(Base):
    __tablename__ = "adminusers"

    # id
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)

    # data
    first_name = Column(String)
    last_name = Column(String)
    username = Column(String, unique=True)
    password = Column(String)
    super_user = Column(Boolean, default=False)