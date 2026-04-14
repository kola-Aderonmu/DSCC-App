import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type ActivityType = "user_signup" | "card_created" | "card_updated" | "card_deleted" | "admin_login";

export async function logActivity(type: ActivityType, userId: string, userName: string, details?: string) {
  try {
    await addDoc(collection(db, "activities"), {
      type,
      userId,
      userName,
      details: details || "",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
