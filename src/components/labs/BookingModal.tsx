import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { LabRoom, TimeSlotString } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

interface BookingModalProps {
  room: LabRoom;
  initialDate?: string;
  initialSlot?: TimeSlotString;
  onClose: () => void;
}

const TIME_SLOTS: TimeSlotString[] = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  initialDate,
  initialSlot,
  onClose,
}) => {
  const { 
    currentUser, 
    checkConflict, 
    createBooking, 
    joinWaitlist,
    bookings 
  } = useLabPulse();

  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState<TimeSlotString>(initialSlot || '10:00 - 12:00');
  const [purpose, setPurpose] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('WIF3001 Final Year Project');
  const [isFYP, setIsFYP] = useState<boolean>(room.highResource);
  const [supervisorName, setSupervisorName] = useState<string>('Prof. Madya Dr. Amir Rudin');
  const [supervisorEmail, setSupervisorEmail] = useState<string>('amirrudin@um.edu.my');

  // Check real-time conflict
  const conflict = checkConflict(room.id, date, slot);

  // Check if current user already has this slot
  const isUserAlreadyBooked = bookings.some(
    (b) => b.roomId === room.id && b.date === date && b.slot === slot && b.userId === currentUser.id && b.status !== 'Cancelled' && b.status !== 'Rejected'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    const result = createBooking({
      roomId: room.id,
      date,
      slot,
      purpose,
      courseCode,
      isFYP,
      supervisorName: isFYP ? supervisorName : undefined,
      supervisorEmail: isFYP ? supervisorEmail : undefined,
    });

    if (result.success) {
      onClose();
    }
  };

  const handleJoinWaitlist = () => {
    joinWaitlist('room', room.id, room.name, `${date} (${slot})`, date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto">
        
        {/* Header with Room Hero snippet */}
        <div className="relative p-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-t-3xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#002B7F]">
                  {room.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">{room.floor}, {room.block}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{room.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{room.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Capacity: {room.capacity} students
            </span>
            {room.highResource && (
              <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md text-[11px]">
                <ShieldAlert className="w-3 h-3 text-amber-600" />
                High-Resource (Supervisor Endorsement Needed)
              </span>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Date & Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Select Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Time Block (2-Hour Slot)
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value as TimeSlotString)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Slot Selector Pills */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Quick Time Slot Picker:</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {TIME_SLOTS.map((s) => {
                const isSelected = slot === s;
                const slotConflict = checkConflict(room.id, date, s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : slotConflict.hasConflict
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">{s.split(' - ')[0]}</div>
                    <div className="text-[9px] opacity-80">{slotConflict.hasConflict ? 'Occupied' : 'Free'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concurrency Conflict Alert Banner */}
          {conflict.hasConflict && (
            <div className="rounded-2xl p-3.5 bg-rose-50 border border-rose-200/90 text-rose-800 text-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Concurrency Slot Conflict Detected</div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    This block ({slot}) is already confirmed by{' '}
                    <span className="font-bold">{conflict.conflictingBooking?.userName}</span> (
                    {conflict.conflictingBooking?.userMatric}). Purpose: &ldquo;
                    {conflict.conflictingBooking?.purpose}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleJoinWaitlist}
                      className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                    >
                      Join Waitlist for This Slot
                    </button>
                    <span className="text-[10px] text-rose-600">
                      You will be automatically promoted if the occupant no-shows.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purpose & Coursework Info */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reservation Purpose & Technical Objective *
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. FYP deep learning GPU benchmarking, YOLOv8 object detection training with PyTorch..."
              rows={2}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coursework / Subject Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. WIF3001 Final Year Project"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User Matric / Role
              </label>
              <input
                type="text"
                value={`${currentUser.name} (${currentUser.matricOrStaffId})`}
                disabled
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* FYP / Supervisor Endorsement Pipeline Toggle */}
          <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isFYP}
                onChange={(e) => setIsFYP(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Coursework / FYP High-Resource Endorsement Required
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Check this for Final Year Project (FYP) experiments, master thesis research, or GPU cluster allocations. This will route to your supervisor dashboard for endorsement.
                </p>
              </div>
            </label>

            {isFYP && (
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Supervisor Name</span>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Supervisor UM Email</span>
                  <input
                    type="email"
                    value={supervisorEmail}
                    onChange={(e) => setSupervisorEmail(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            
            {conflict.hasConflict ? (
              <button
                type="button"
                onClick={handleJoinWaitlist}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                Join Waitlist Queue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isUserAlreadyBooked}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#002B7F] hover:bg-blue-800 text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isFYP ? 'Submit for Supervisor Endorsement' : 'Confirm Instant Reservation'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
