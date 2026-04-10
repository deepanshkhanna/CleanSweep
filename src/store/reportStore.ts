import { create } from "zustand";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Report } from "@/types/report";

interface ReportStore {
  reports: Report[];
  loading: boolean;
  subscribe: () => () => void;
  addReport: (
    data: Omit<Report, "id" | "createdAt" | "status"> & { photoFile?: File }
  ) => Promise<void>;
  claimReport: (id: string, volunteerName: string, volunteerEmail?: string) => Promise<void>;
  submitCleanupProof: (id: string, photoFile: File) => Promise<void>;
  verifyCleanup: (id: string, note: string) => Promise<void>;
  markCleaned: (id: string) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  loading: true,

  subscribe: () => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Report
      );
      set({ reports: data, loading: false });
    });
    return unsubscribe;
  },

  addReport: async (data) => {
    let photoUrl = data.photoUrl;

    if (data.photoFile) {
      const storageRef = ref(
        storage,
        `photos/${Date.now()}_${data.photoFile.name}`
      );
      const snap = await uploadBytes(storageRef, data.photoFile);
      photoUrl = await getDownloadURL(snap.ref);
    }

    await addDoc(collection(db, "reports"), {
      lat: data.lat,
      lng: data.lng,
      severity: data.severity,
      status: "reported",
      description: data.description,
      photoUrl,
      address: data.address ?? "",
      createdAt: Timestamp.now(),
    });
  },

  claimReport: async (id, volunteerName, volunteerEmail) => {
    set({
      reports: get().reports.map((r) =>
        r.id === id
          ? { ...r, status: "in_progress" as const, claimedBy: volunteerName, claimedByEmail: volunteerEmail }
          : r
      ),
    });
    await updateDoc(doc(db, "reports", id), {
      status: "in_progress",
      claimedBy: volunteerName,
      ...(volunteerEmail ? { claimedByEmail: volunteerEmail } : {}),
    });
  },

  submitCleanupProof: async (id, photoFile) => {
    const storageRef = ref(storage, `cleanup_proofs/${Date.now()}_${photoFile.name}`);
    const snap = await uploadBytes(storageRef, photoFile);
    const cleanupPhotoUrl = await getDownloadURL(snap.ref);

    set({
      reports: get().reports.map((r) =>
        r.id === id
          ? { ...r, status: "pending_verification" as const, cleanupPhotoUrl }
          : r
      ),
    });
    await updateDoc(doc(db, "reports", id), {
      status: "pending_verification",
      cleanupPhotoUrl,
    });
  },

  verifyCleanup: async (id, note) => {
    set({
      reports: get().reports.map((r) =>
        r.id === id
          ? { ...r, status: "verified" as const, verifiedNote: note, verifiedAt: Timestamp.now() }
          : r
      ),
    });
    await updateDoc(doc(db, "reports", id), {
      status: "verified",
      verifiedNote: note,
      verifiedAt: Timestamp.now(),
    });
  },

  markCleaned: async (id) => {
    set({
      reports: get().reports.map((r) =>
        r.id === id ? { ...r, status: "cleaned" as const } : r
      ),
    });
    await updateDoc(doc(db, "reports", id), {
      status: "cleaned",
    });
  },
}));
