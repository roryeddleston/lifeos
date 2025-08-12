"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, ListTodo, Target, Activity } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Habits", href: "/habits", icon: Activity },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Goals", href: "/goals", icon: Target },
];

export default function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-lg"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="font-semibold tracking-tight">Life OS</span>
              <button
                className="rounded p-2 hover:bg-gray-100"
                aria-label="Close menu"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="px-2 py-3">
              <ul className="space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                          ${
                            active
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        onClick={onClose}
                      >
                        <Icon
                          size={18}
                          className={`${
                            active ? "opacity-100" : "opacity-80"
                          } shrink-0`}
                        />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
