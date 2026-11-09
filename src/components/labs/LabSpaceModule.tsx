import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { LabCategory, LabRoom, TimeSlotString } from '../../types';
import { BookingModal } from './BookingModal';
import { 
  Building2, 
  Search, 
  Filter, 
  Users, 
  Cpu, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Grid3X3, 
  Table2,
  ChevronRight,
  Info
} from 'lucide-react';

const CATEGORIES: ('All' | LabCategory)[] = [
  'All',
  'AI & Data Science',
  'Software Engineering',
  'Networking & Security',
  'IoT & Robotics',
  'Meeting & Seminar',
];

const TIME_SLOTS: TimeSlotString[] = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
];

export const LabSpaceModule: React.FC = () => {
  const { rooms, bookings, currentUser, setActiveTab } = useLabPulse();

  const [selectedCategory, setSelectedCategory] = useState<'All' | LabCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  // Booking modal state
  const [activeModalRoom, setActiveModalRoom] = useState<LabRoom | null>(null);
  const [preselectedSlot, setPreselectedSlot] = useState<TimeSlotString | undefined>(undefined);

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesCategory = selectedCategory === 'All' || room.category === selectedCategory;
    const matchesQuery =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const getSlotBookingInfo = (roomId: string, slot: TimeSlotString) => {
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === selectedDate &&
        b.slot === slot &&
        (b.status === 'Approved' || b.status === 'Active')
    );
  };

  const handleOpenBooking = (room: LabRoom, slot?: TimeSlotString) => {
    setActiveModalRoom(room);
    setPreselectedSlot(slot);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bento-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002B7F] text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Universiti Malaya • FCSIT Computer Labs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Laboratory Space Reservation & Conflict Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Real-time slot reservation across Block A, B, and C with automated concurrency conflict detection, 15-minute grace period enforcement, and FYP supervisor endorsement routing.
            </p>
          </div>

          {/* Quick Date & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <Calendar className="w-4 h-4 text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Bento Card View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'matrix' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Timetable Matrix View"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#002B7F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lab, RTX 4090, Cisco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* MATRIX VIEW (Schedule Matrix across all labs) */}
      {viewMode === 'matrix' ? (
        <div className="bento-card rounded-3xl p-5 border border-slate-200/90 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">FCSIT Daily Laboratory Schedule Matrix</h3>
              <p className="text-xs text-slate-500">Showing 2-hour operational blocks for {selectedDate}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300"></span> Free
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300"></span> Booked
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300"></span> My Slot
              </span>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3 rounded-l-xl">Laboratory</th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot} className="p-3 text-center">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-medium text-slate-900">
                    <div className="font-bold">{room.name}</div>
                    <div className="text-[10px] text-slate-500">{room.code} • {room.capacity} pax</div>
                  </td>
                  {TIME_SLOTS.map((slot) => {
                    const booking = getSlotBookingInfo(room.id, slot);
                    const isMyBooking = booking?.userId === currentUser.id;

                    return (
                      <td key={slot} className="p-2 text-center">
                        {booking ? (
                          <div
                            onClick={() => {
                              if (isMyBooking) setActiveTab('my-passes');
                              else handleOpenBooking(room, slot);
                            }}
                            className={`p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                              isMyBooking
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-sm'
                                : 'bg-rose-50/90 border-rose-200 text-rose-800'
                            }`}
                            title={`Booked by ${booking.userName}: ${booking.purpose}`}
                          >
                            <div className="font-semibold truncate">{isMyBooking ? 'You' : booking.userName}</div>
                            <div className="text-[9px] opacity-75 truncate">{booking.status}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenBooking(room, slot)}
                            className="w-full p-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition-all font-medium"
                          >
                            + Book
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD / BENTO GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            // Count free slots today
            const bookedCount = TIME_SLOTS.filter((s) => getSlotBookingInfo(room.id, s)).length;
            const freeSlotsCount = TIME_SLOTS.length - bookedCount;

            return (
              <div
                key={room.id}
                className="bento-card rounded-3xl overflow-hidden border border-slate-200/90 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Cover & Tag Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    
                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {room.code}
                      </span>
                      {room.highResource && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-slate-950 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          High-Resource
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                        freeSlotsCount > 0 
                          ? 'bg-emerald-500/90 text-white border-emerald-400' 
                          : 'bg-rose-500/90 text-white border-rose-400'
                      }`}>
                        {freeSlotsCount > 0 ? `${freeSlotsCount} Slots Open` : 'Fully Booked'}
                      </span>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-bold text-base leading-tight drop-shadow-sm">{room.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-200 mt-1">
                        <span>{room.floor}, {room.block}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-300" />
                          {room.capacity} Seats
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Specs & Amenities */}
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{room.description}</p>

                    {/* Tech specs bullet highlights */}
                    <div className="mt-3.5 space-y-1.5">
                      {room.specs.gpus && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl">
                          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{room.specs.gpus}</span>
                        </div>
                      )}
                      {room.specs.networkingGear && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{room.specs.networkingGear}</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {room.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Interactive 2-Hour Slot Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Select Slot ({selectedDate})
                        </span>
                        <span>08:00 - 18:00</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {TIME_SLOTS.map((slot) => {
                          const booking = getSlotBookingInfo(room.id, slot);
                          const isMine = booking?.userId === currentUser.id;

                          return (
                            <button
                              key={slot}
                              onClick={() => {
                                if (isMine) setActiveTab('my-passes');
                                else handleOpenBooking(room, slot);
                              }}
                              className={`py-1.5 px-0.5 text-center rounded-xl text-[10px] font-bold transition-all border ${
                                isMine
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : booking
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
                              }`}
                              title={
                                booking
                                  ? `Reserved: ${booking.userName} (${slot}). Click to join waitlist.`
                                  : `Available for ${slot}. Click to reserve.`
                              }
                            >
                              <div>{slot.split(' - ')[0]}</div>
                              <div className="text-[8px] font-normal opacity-80 truncate">
                                {isMine ? 'You' : booking ? 'Busy' : 'Open'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenBooking(room)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Reserve Space & Slot</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {activeModalRoom && (
        <BookingModal
          room={activeModalRoom}
          initialDate={selectedDate}
          initialSlot={preselectedSlot}
          onClose={() => {
            setActiveModalRoom(null);
            setPreselectedSlot(undefined);
          }}
        />
      )}
    </div>
  );
};

