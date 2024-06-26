from typing import Annotated
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from requests import Session

from database.database import SessionLocal
from models.models import AdminUser, AttendanceEntryType, AttendanceSession
from operations.authentication import get_current_user

import operations.attendance_operations as attendance_operations

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    
class AttendanceConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, committee_id: int):
        await websocket.accept()
        if committee_id not in self.active_connections:
            self.active_connections[committee_id] = []
            
        self.active_connections[committee_id].append(websocket)
 
    def disconnect(self, websocket: WebSocket, committee_id: int):
        self.active_connections[committee_id].remove(websocket)
                
    async def broadcast_attendance(self, committee_id: int, update_json: AttendanceSession):
        if committee_id in self.active_connections:
            for con in self.active_connections[committee_id]:
                await con.send_json(update_json.to_dict())
        else:
            print(f"Committee {committee_id} not in arr")
 
manager = AttendanceConnectionManager()

        
@router.post("/attendance/start", tags=["Attendance"])
async def start_attendance(committee_id: int, user: Annotated[AdminUser, Depends(get_current_user)], db: Session = Depends(get_db)):
    attendance_session = attendance_operations.create_attendance_session(db, committee_id)
    await manager.broadcast_attendance(committee_id, attendance_session)
    
    return attendance_session


@router.post("/attendance/end", tags=["Attendance"])
async def end_current_attendance(committee_id: int, user: Annotated[AdminUser, Depends(get_current_user)], db: Session = Depends(get_db)):
    attendance_session = attendance_operations.end_current_attendance_session(db, committee_id)
    await manager.broadcast_attendance(committee_id, attendance_session)
    
    return attendance_session


@router.get("/attendance", tags=["Attendance"])
def get_current_attendance(committee_id: int, db: Session = Depends(get_db)):
    return attendance_operations.get_current_attendance_session(db, committee_id)


@router.get("/attendance/closed", tags=["Attendance"])
def get_closed_attendance(committee_id: int, user: Annotated[AdminUser, Depends(get_current_user)], db: Session = Depends(get_db)):
    return attendance_operations.get_closed_attendance_sessions(db, committee_id)


@router.get("/attendance/delegation", tags=["Attendance"])
def get_recent_delegation_attendance(committee_id: int, delegation_id: int, db: Session = Depends(get_db)):
    return attendance_operations.get_most_recent_submission(db, committee_id, delegation_id)


@router.post("/attendance/submit", tags=["Attendance"])
async def cast_attendance(committee_id: int, delegation_id: int, submission: AttendanceEntryType, db: Session = Depends(get_db)):
    attendance = attendance_operations.submit_attendance(db, committee_id, delegation_id, submission)
    await manager.broadcast_attendance(committee_id, attendance)
    
    return attendance


@router.post("/attendance/override", tags=["Attendance"])
async def override_attendance(committee_id: int, delegation_id: int, submission: AttendanceEntryType, user: Annotated[AdminUser, Depends(get_current_user)], db: Session = Depends(get_db)):
    attendance = attendance_operations.submit_attendance(db, committee_id, delegation_id, submission, admin_override = True)
    await manager.broadcast_attendance(committee_id, attendance)
    
    return attendance


@router.post("/attendance/markabsent", tags=["Attendance"])
async def mark_absent(committee_id: int, delegation_id: int, user: Annotated[AdminUser, Depends(get_current_user)], db: Session = Depends(get_db)):
    attendance = attendance_operations.remove_attendance_submission(db, committee_id, delegation_id)
    await manager.broadcast_attendance(committee_id, attendance)
    
    return attendance


# websocket for attendance
@router.websocket("/attendance/{committee_id}/ws")
async def committee_websocket_endpoint(websocket: WebSocket, committee_id: int):
    await manager.connect(websocket, committee_id)
    try:
        while True:
            heartbeat = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, committee_id)