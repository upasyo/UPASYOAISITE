import React, { useState, useEffect } from "react";
import { db, COLLECTIONS } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "motion/react";

export default function ButtonLinks() {
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    const colRef = collection(db, COLLECTIONS.BUTTON_LINKS);
    const q = query(colRef, orderBy("name", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData: any[] = [];
      snapshot.forEach((doc) => {
        linksData.push({ id: doc.id, ...doc.data() });
      });
      setLinks(linksData);
    });

    return () => unsubscribe();
  }, []);

  if (links.length === 0) return null;

  return (
    <>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: link.color || "#e11d48" }}
        >
          {link.name}
        </a>
      ))}
    </>
  );
}
