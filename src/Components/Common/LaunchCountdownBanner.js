"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiClock, FiShoppingBag, FiStar } from "react-icons/fi";
import { launchCountdownApi } from "@/Service/api";

const STORAGE_KEY = "sp_launch_countdown_dismissed";

function getTimeLeft(targetMs) {
  const difference = Math.max(0, targetMs - Date.now());
  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: difference <= 0,
  };
}

function DigitBox({ digit }) {
  return (
    <span className="launch-countdown__digit-box">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="launch-countdown__digit-value"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function TimeUnit({ value, label }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="launch-countdown__unit">
      <div className="launch-countdown__digit-group">
        <DigitBox digit={padded[0]} />
        <DigitBox digit={padded[1]} />
      </div>
      <span>{label}</span>
    </div>
  );
}

export default function LaunchCountdownBanner() {
  const [config, setConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {
      // storage unavailable — banner simply stays visible for the session
    }

    let active = true;
    launchCountdownApi
      .get()
      .then((res) => {
        if (active && res.data?.action) setConfig(res.data.data?.launchCountdown || null);
      })
      .catch(() => {
        // silently skip — a missing/unreachable config just means no banner
      });

    return () => {
      active = false;
    };
  }, []);

  const targetMs = config?.targetDate ? new Date(config.targetDate).getTime() : null;

  useEffect(() => {
    if (!targetMs) return undefined;
    setTimeLeft(getTimeLeft(targetMs));
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(targetMs)), 1000);
    return () => window.clearInterval(timer);
  }, [targetMs]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
  };

  const shouldRender =
    mounted && config?.enabled && targetMs && timeLeft && !timeLeft.expired && !dismissed;

  if (!shouldRender) return null;

  const isUrgent = timeLeft.days === 0;
  const position = config.position === "fixed-center" ? "fixed-center" : "below-header";
  const title = config.title || "Sehat Potli is launching soon.";
  const description = config.description || "Get ready to shop goodness for every home.";
  const srLabel = `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes and ${timeLeft.seconds} seconds until launch`;

  const banner = (
    <section
      className={[
        "launch-countdown",
        `launch-countdown--${position}`,
        isUrgent ? "launch-countdown--urgent" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Website launch countdown"
      onDoubleClick={handleDismiss}
      title="Double-click to dismiss"
    >
      <div className="launch-countdown__shine" aria-hidden="true" />
      <div className="launch-countdown__sparkles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="launch-countdown__inner">
        <div className="launch-countdown__message">
          <span className="launch-countdown__eyebrow">
            <span className="launch-countdown__pulse-dot" aria-hidden="true" />
            <FiStar size={13} /> Something nourishing is coming
          </span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="launch-countdown__right">
          <div className="launch-countdown__timer-label">
            <FiClock size={14} /> Time until launch
          </div>
          <div className="launch-countdown__timer" role="timer" aria-label={srLabel}>
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="launch-countdown__colon">:</span>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <span className="launch-countdown__colon">:</span>
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <span className="launch-countdown__colon launch-countdown__colon--seconds">:</span>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
          <span className="launch-countdown__cta">
            Shopping starts soon <FiShoppingBag size={15} /> <FiArrowRight size={15} />
          </span>
        </div>
      </div>

      <span className="launch-countdown__hint">Double-click to dismiss</span>
    </section>
  );

  if (position === "fixed-center") {
    return createPortal(banner, document.body);
  }
  return banner;
}
