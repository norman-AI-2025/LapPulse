import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { LabCategory, LabRoom } from '../../types';
import { SpaceTimetableView } from './SpaceTimetableView';
import { 
  Building2, 
  MapPin, 
  Users, 
  Search, 
  ChevronRight, 
  Cpu, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  Wrench
} from 'lucide-react';

const CATEGORIES: ('All' | LabCategory)[] = [
  'All',
  'Computer Laboratories',
  'Specialized & AI',
  'Networking & Security',
  'Lecture & Classrooms',
  'Student Amenities'
];

export const LabSpaceModule: React.FC = () => {
  const { rooms, bookings, reports } = useLabPulse();

  // Active space view state (null = show all space containers)
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'All' | LabCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Find active room if selected
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesCategory = selectedCategory === 'All' || room.category === selectedCategory;
    const matchesQuery =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.block.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // If a space is clicked into, render its complete interactive timetable schedule
  if (activeRoom) {
    return (
      <SpaceTimetableView
        room={activeRoom}
        onBack={() => setActiveRoomId(null)}
        onSelectRoom={(id) => setActiveRoomId(id)}
      />
    );
  }

  // Otherwise, render the Clean Spaces Containers Grid
  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            FCSIT Laboratory Spaces
          </h1>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search space or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat === 'All' ? rooms.length : rooms.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SPACES CONTAINERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          // Check if space is under repair
          const isUnderRepair = room.status === 'Under Repair' || reports.some(r => r.type === 'SPACE' && r.targetId === room.id && r.status === 'IN REPAIR');

          // Count active bookings today
          const todayBookingsCount = bookings.filter(
            (b) => b.roomId === room.id && (b.status === 'Approved' || b.status === 'Active')
          ).length;

          return (
            <div
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`bg-white rounded-3xl overflow-hidden border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                isUnderRepair 
                  ? 'border-rose-200 shadow-xs hover:border-rose-400' 
                  : 'border-slate-200/90 hover:border-slate-400/80 hover:shadow-md'
              }`}
            >
              <div>
                {/* 1. Image of the Space */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Room Code Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                      {room.code}
                    </span>
                  </div>

                  {/* Status Tag */}
                  {isUnderRepair ? (
                    <div className="absolute top-3 right-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        <span>[UNDER REPAIR]</span>
                      </span>
                    </div>
                  ) : room.highResource ? (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
                        Supervisor Endorsement
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 2. Name & Location of the Space */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                      {room.name}
                    </h3>
                  </div>

                  {/* Location with Pin Icon */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{room.floor}, {room.block} (FCSIT)</span>
                  </div>

                  {/* Subtle Meta: Capacity & Category */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {room.capacity} seats
                    </span>
                    <span className={isUnderRepair ? 'font-bold text-rose-600' : ''}>
                      {isUnderRepair ? 'Facility In Repair' : room.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Action Link to View Timetable */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                {isUnderRepair ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold flex items-center justify-between border border-rose-200">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-rose-600" />
                      <span>[UNDER REPAIR • BOOKINGS DISABLED]</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>View Timetable & Schedule</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
