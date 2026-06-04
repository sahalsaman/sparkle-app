"use client";

import { motion } from "framer-motion";
import { Trophy, Gamepad2, Flame, MessagesSquare } from "lucide-react";

const items = [
  { icon: Trophy, text: "Priya overtook you for #1 with 2840 pts", time: "2m" },
  { icon: Gamepad2, text: "Memory game — your best score this week", time: "12m" },
  { icon: Flame, text: "New challenge: Desk plant glow-up 🌱", time: "1h" },
  { icon: MessagesSquare, text: "Marco posted in #design-team", time: "3h" },
  { icon: Trophy, text: "You earned the 7-day streak badge 🔥", time: "1d" },
];

export function ActivityFeed() {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <it.icon className="h-4 w-4" />
          </div>
          <p className="flex-1 text-sm">{it.text}</p>
          <span className="text-xs text-muted-foreground">{it.time}</span>
        </motion.li>
      ))}
    </ul>
  );
}
