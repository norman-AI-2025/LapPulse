import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { LabRoom, TimeSlotString } from '../../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  AlertCircle, 
  Plus, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';

const TIME_SLOTS: TimeSlotString[] = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
];

export const LabSpaceModule: React.FC = () => {
  const { rooms, bookings, currentUser, createBooking, joinWaitlist, setActiveTab } = useLabPulse();

  // Selected space and date
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'lab-ai-1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking drawer/form state
  const [bookingSlot, setBookingSlot] = useState<TimeSlotString | null>(null);
  const [purpose, setPurpose] = useState('');
  const [isFYP, setIsFYP] = useState(false);

  // Active selected room
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Helper dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Filtered rooms list
  const filteredRooms = rooms.filter((r) => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get booking info for a slot in the active room on the selected date
  const getSlotBooking = (slot: TimeSlotString) => {
    return bookings.find(
      (b) =>
        b.roomId === selectedRoom.id &&
        b.date === selectedDate &&
        b.slot === slot &&
        (b.status === 'Approved' || b.status === 'Active' || b.status === 'Pending Approval')
    );
  };

  const handleBookSlotClick = (slot: TimeSlotString) => {
    setBookingSlot(slot);
    setPurpose('');
    setIsFYP(selectedRoom.highResource);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSlot || !purpose.trim()) return;

    createBooking({
      roomId: selectedRoom.id,
      date: selectedDate,
      slot: bookingSlot,
      purpose: purpose.trim(),
      isFYP,
      supervisorName: isFYP ? 'Prof. Madya Dr. Amir Rudin' : undefined,
      supervisorEmail: isFYP ? 'amirrudin@um.edu.my' : undefined,
    });

    setBookingSlot(null);
  };

  const handleJoinSlotWaitlist = (slot: TimeSlotString) => {
    joinWaitlist('room', selectedRoom.id, selectedRoom.name, `${selectedDate} (${slot})`, selectedDate);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Top Minimal Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Lab Spaces</h1>
          <p className="text-xs text-slate-500">Select a space to view its complete daily schedule.</p>
        </div>

        {/* Minimal Date Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDate === todayStr ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDate === tomorrowStr ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow
          </button>
          <div className="flex items-center gap-1 pl-1 pr-2 border-l border-slate-100">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-medium bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Clean 2-Column Layout: Spaces List (Left) & Full Day Timetable (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Clean Spaces Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Spaces List */}
          <div className="space-y-2">
            {filteredRooms.map((room) => {
              const isSelected = room.id === selectedRoom.id;
              
              // Count available slots today
              const bookedSlotsCount = TIME_SLOTS.filter((s) => {
                return bookings.some(
                  (b) => b.roomId === room.id && b.date === selectedDate && b.slot === s && (b.status === 'Approved' || b.status === 'Active')
                );
              }).length;
              const freeSlots = TIME_SLOTS.length - bookedSlotsCount;

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setBookingSlot(null);
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {room.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {room.code} • {room.floor}, {room.block}
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      freeSlots > 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {freeSlots} free
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
                    <span>{room.capacity} seats</span>
                    {room.highResource ? (
                      <span className="text-amber-700 font-medium">Supervisor signoff</span>
                    ) : (
                      <span className="text-slate-400">Instant book</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Schedule Timetable for Selected Space (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
          
          {/* Timetable Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedRoom.code}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{selectedRoom.floor}, {selectedRoom.block}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedRoom.name}</h2>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-800">
                Schedule for {selectedDate === todayStr ? 'Today' : selectedDate}
              </span>
              <div className="text-[11px] text-slate-400">Operational Hours: 08:00 – 18:00</div>
            </div>
          </div>

          {/* SCHEDULE TIMETABLE GRID */}
          <div className="space-y-2.5">
            {TIME_SLOTS.map((slot) => {
              const booking = getSlotBooking(slot);
              const isMine = booking?.userId === currentUser.id;
              const isOccupied = !!booking;
              const isSelectedForBooking = bookingSlot === slot;

              return (
                <div
                  key={slot}
                  className={`rounded-2xl p-3.5 transition-all border ${
                    isSelectedForBooking
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : isMine
                      ? 'border-blue-200 bg-blue-50/20'
                      : isOccupied
                      ? 'border-slate-100 bg-slate-50/60'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Time Slot Badge & Icon */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{slot}</div>
                        <div className="text-[11px] text-slate-400">2-Hour Lab Session</div>
                      </div>
                    </div>

                    {/* Middle: Slot Status */}
                    <div className="flex-1 sm:px-4">
                      {isOccupied ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span className="font-semibold text-slate-800">
                              {isMine ? 'You booked this slot' : `Booked by ${booking.userName}`}
                            </span>
                            <span className="text-[10px] text-slate-400">({booking.status})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {booking.purpose}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Available for reservation</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="self-end sm:self-center">
                      {isMine ? (
                        <button
                          onClick={() => setActiveTab('my-passes')}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          View Pass
                        </button>
                      ) : isOccupied ? (
                        <button
                          onClick={() => handleJoinSlotWaitlist(slot)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                        >
                          Join Waitlist
                        </button>
                      ) : isSelectedForBooking ? (
                        <button
                          onClick={() => setBookingSlot(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-medium"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookSlotClick(slot)}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Book</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Inline Booking Form */}
                  {isSelectedForBooking && (
                    <form onSubmit={handleSubmitBooking} className="mt-3.5 pt-3.5 border-t border-blue-100 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Reservation Purpose
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FYP Deep Learning benchmark or practical coursework..."
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={isFYP}
                            onChange={(e) => setIsFYP(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span>FYP / High-resource session (Requires supervisor endorsement)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBookingSlot(null)}
                            className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
                          >
                            Discard
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-[#002B7F] hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            Confirm Reservation
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>

          {/* Space Facilities Footer - Simple & Clean */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Amenities:</span>
              <span className="text-slate-600 font-medium">
                {selectedRoom.amenities.slice(0, 3).join(' • ')}
              </span>
            </div>
            <span>FCSIT Universiti Malaya</span>
          </div>
        </div>
      </div>
    </div>
  );
};
