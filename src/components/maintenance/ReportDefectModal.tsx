import React, { useState, useEffect, useRef } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { 
  ReportType, 
  SpaceRepairCategory, 
  HardwareDefectCategory 
} from '../../types';
import { X, Upload, Camera, Image as ImageIcon, AlertTriangle, Check } from 'lucide-react';

const SPACE_CATEGORIES: SpaceRepairCategory[] = [
  'AIR CONDITIONING / VENTILATION',
  'ELECTRICAL / POWER SOCKET',
  'PROJECTOR / AUDIO VISUAL',
  'FURNITURE / CHAIR / DESK',
  'LIGHTING / FIXTURE',
  'NETWORK / LAN PORT'
];

const HARDWARE_CATEGORIES: HardwareDefectCategory[] = [
  'POWER / BOOT FAILURE',
  'PHYSICAL / CHASSIS DAMAGE',
  'PORT / CONNECTOR DEFECT',
  'MISSING ACCESSORY / CABLE',
  'OVERHEATING / NOISE',
  'SOFTWARE / OS CORRUPTION'
];

export const ReportDefectModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    closeReportModal, 
    reportModalInitialMode, 
    reportModalTargetId,
    rooms, 
    hardware, 
    currentUser, 
    submitMaintenanceReport 
  } = useLabPulse();

  const [mode, setMode] = useState<ReportType>('SPACE');

  // Space form state
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [specificLocation, setSpecificLocation] = useState<string>('');
  const [selectedSpaceCategory, setSelectedSpaceCategory] = useState<SpaceRepairCategory>('ELECTRICAL / POWER SOCKET');

  // Hardware form state
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [selectedHardwareCategory, setSelectedHardwareCategory] = useState<HardwareDefectCategory>('PORT / CONNECTOR DEFECT');

  // Shared state
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser. Please upload an image.');
        cameraInputRef.current?.click();
        return;
      }

      setIsCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera permissions in browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera detected on this machine. Please upload an image.');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
      stopCamera();
      // Fallback to native capture input if direct stream failed
      cameraInputRef.current?.click();
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo frame from video canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoUrl(dataUrl);
    }
    stopCamera();
  };

  // Cleanup camera stream when closing or unmounting
  useEffect(() => {
    if (!isReportModalOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isReportModalOpen]);

  // Initialize defaults on open
  useEffect(() => {
    if (!isReportModalOpen) return;

    const initialMode = reportModalInitialMode || 'SPACE';
    setMode(initialMode);
    setDescription('');
    setPhotoUrl(null);

    if (initialMode === 'SPACE') {
      if (reportModalTargetId && rooms.some((r) => r.id === reportModalTargetId)) {
        setSelectedRoomId(reportModalTargetId);
      } else if (rooms.length > 0) {
        setSelectedRoomId(rooms[0].id);
      }
      setSpecificLocation('');
      setSelectedSpaceCategory('ELECTRICAL / POWER SOCKET');
    } else {
      if (reportModalTargetId && hardware.some((h) => h.id === reportModalTargetId)) {
        const item = hardware.find((h) => h.id === reportModalTargetId);
        setSelectedHardwareId(reportModalTargetId);
        setSerialNumber(item?.serialNumber || item?.tag || '');
      } else if (hardware.length > 0) {
        setSelectedHardwareId(hardware[0].id);
        setSerialNumber(hardware[0].serialNumber || hardware[0].tag);
      }
      setSelectedHardwareCategory('PORT / CONNECTOR DEFECT');
    }
  }, [isReportModalOpen, reportModalInitialMode, reportModalTargetId, rooms, hardware]);

  // When selected hardware changes, auto-fill serial number
  const handleHardwareChange = (hwId: string) => {
    setSelectedHardwareId(hwId);
    const item = hardware.find((h) => h.id === hwId);
    if (item) {
      setSerialNumber(item.serialNumber || item.tag);
    }
  };

  // Image Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    if (mode === 'SPACE') {
      const targetRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
      submitMaintenanceReport({
        type: 'SPACE',
        targetId: targetRoom.id,
        targetName: targetRoom.name,
        targetCodeOrTag: targetRoom.code,
        specificLocation: specificLocation.trim() || undefined,
        category: selectedSpaceCategory,
        description: description.trim(),
        photoUrl: photoUrl || undefined
      });
    } else {
      const targetHw = hardware.find((h) => h.id === selectedHardwareId) || hardware[0];
      submitMaintenanceReport({
        type: 'HARDWARE',
        targetId: targetHw.id,
        targetName: targetHw.name,
        targetCodeOrTag: targetHw.tag,
        serialNumber: serialNumber.trim() || targetHw.serialNumber,
        category: selectedHardwareCategory,
        description: description.trim(),
        photoUrl: photoUrl || undefined
      });
    }

    setIsSubmitting(false);
    closeReportModal();
  };

  if (!isReportModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        onClick={closeReportModal}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider">
                FCSIT Operations
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Reporter: {currentUser.name} ({currentUser.matricOrStaffId})
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1">
              File Defect & Maintenance Ticket
            </h2>
          </div>

          <button
            onClick={closeReportModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Two-Segment Mode Switch */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Defect Target
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('SPACE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  mode === 'SPACE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                [SPACE / ROOM REPAIR]
              </button>
              <button
                type="button"
                onClick={() => setMode('HARDWARE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  mode === 'HARDWARE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                [HARDWARE DEFECT]
              </button>
            </div>
          </div>

          {/* SPACE / ROOM REPAIR MODE FIELDS */}
          {mode === 'SPACE' && (
            <div className="space-y-4">
              {/* Target Facility Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Target Facility / Venue
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) — {r.floor}, {r.block}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Location inside Room */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Specific Location / Station Inside Room
                </label>
                <input
                  type="text"
                  placeholder="e.g., Workstation PC-14, Main Projector Wall, Rack Unit B"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Repair Category Selector Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Repair Classification Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SPACE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSpaceCategory(cat)}
                      className={`p-2 rounded-xl text-[10px] font-bold text-left transition-all border ${
                        selectedSpaceCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      [{cat}]
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HARDWARE DEFECT MODE FIELDS */}
          {mode === 'HARDWARE' && (
            <div className="space-y-4">
              {/* Target Hardware Identifier */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Target Equipment Asset
                </label>
                <select
                  value={selectedHardwareId}
                  onChange={(e) => handleHardwareChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900"
                >
                  {hardware.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} [{h.tag}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial Number / Asset Tag Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Asset Tag / Monospace Serial Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., SN-NV-ORIN-9421 or FCSIT-HW-042"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900"
                />
              </div>

              {/* Hardware Defect Type Selector Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Hardware Malfunction Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {HARDWARE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedHardwareCategory(cat)}
                      className={`p-2 rounded-xl text-[10px] font-bold text-left transition-all border ${
                        selectedHardwareCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      [{cat}]
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Photo Attachment Container */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Physical Fault Evidence Photograph
            </label>

            {/* Hidden File Picker Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Hidden Direct Camera Capture Input */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* 1. Live Camera Viewfinder Mode */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-900 bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CAMERA ACTIVE</span>
                </div>

                {/* Shutter / Capture Actions */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2.5 px-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs uppercase tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-slate-900" />
                    <span>[SNAP PHOTO]</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-900/80 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase transition-all backdrop-blur-xs cursor-pointer"
                  >
                    [CANCEL]
                  </button>
                </div>
              </div>
            ) : photoUrl ? (
              /* 2. Photo Captured or Uploaded Preview */
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={photoUrl}
                  alt="Defect Evidence"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>[RETAKE PHOTO]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg backdrop-blur-xs hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    [REMOVE PHOTO]
                  </button>
                </div>
              </div>
            ) : (
              /* 3. Empty State with Take Photo & Upload Options */
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                {cameraError && (
                  <div className="mb-2 text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    {cameraError}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Direct camera access to take picture or local file upload supported.
                </p>
              </div>
            )}
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Fault Symptoms & Operational Impact
            </label>
            <textarea
              required
              rows={3}
              placeholder={
                mode === 'SPACE'
                  ? 'Concise explanation (e.g., Socket spark on switch-on; trip hazard and intermittent breaker drop during class benchmark).'
                  : 'Concise explanation (e.g., Device powers down after 2 minutes; severe fan whining; missing 19V barrel power adapter).'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Form Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide uppercase transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{mode === 'SPACE' ? '[SUBMIT SPACE REPORT]' : '[SUBMIT HARDWARE DEFECT REPORT]'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

