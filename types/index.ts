export interface MeetingRoom {
  id: number
  roomNumber: number
  roomName: string
  capacity: number
  facilities?: string
  status: 'available' | 'maintenance'
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  id: number
  name: string
  email: string
  authCode?: string
  department?: string
  position?: string
  createdAt: Date
  updatedAt: Date
}

export interface Meeting {
  id: number
  roomId: number
  title: string
  startTime: Date
  endTime: Date
  organizerId: number
  description?: string
  status: 'scheduled' | 'cancelled' | 'completed'
  createdAt: Date
  updatedAt: Date
  room?: MeetingRoom
  organizer?: TeamMember
  participants?: MeetingParticipant[]
}

export interface MeetingParticipant {
  id: number
  meetingId: number
  memberId: number
  status: 'invited' | 'confirmed' | 'rejected'
  createdAt: Date
  meeting?: Meeting
  member?: TeamMember
}

export interface CheckIn {
  id: number
  meetingId: number
  memberId: number
  checkInTime: Date
  status: 'normal' | 'late' | 'absent'
  createdAt: Date
  meeting?: Meeting
  member?: TeamMember
}

export interface CreateMeetingDto {
  roomId: number
  title: string
  startTime: string
  endTime: string
  organizerId: number
  description?: string
  participantIds: number[]
}

export interface CreateTeamMemberDto {
  name: string
  email: string
  authCode?: string
  department?: string
  position?: string
}

