"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface Props {
  run: boolean;
  onFinish: () => void;
}

export function ClassroomTour({ run, onFinish }: Props) {
  useEffect(() => {
    if (!run) return;
    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: [
        {
          element: "#tab-home",
          popover: {
            title: "🏠 Home",
            description: "Start here — your tutor's welcome note, class rules, and what you need to earn your certificate.",
            side: "bottom",
          },
        },
        {
          element: "#tab-chat",
          popover: {
            title: "💬 Class Chat",
            description: "Talk to your classmates and tutors in real-time. Ask questions, share resources, collaborate.",
            side: "bottom",
          },
        },
        {
          element: "#tab-assignments",
          popover: {
            title: "📋 Assignments",
            description: "View all assignments from your tutor. Active ones show a countdown timer — submit before the deadline!",
            side: "bottom",
          },
        },
        {
          element: "#tab-attendance",
          popover: {
            title: "✅ Attendance",
            description: "When your tutor opens an attendance session, a Check In button appears here. Your attendance counts toward your certificate.",
            side: "bottom",
          },
        },
        {
          element: "#tab-curriculum",
          popover: {
            title: "📚 Curriculum",
            description: "Browse the full course curriculum — all modules and lessons for your track.",
            side: "bottom",
          },
        },
        {
          element: "#progress-ring",
          popover: {
            title: "🏆 Your Progress",
            description: "This ring shows your current score toward certification. Keep it above the pass threshold set by your tutor!",
            side: "left",
          },
        },
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
        onFinish();
      },
    });
    driverObj.drive();
  }, [run, onFinish]);

  return null;
}
