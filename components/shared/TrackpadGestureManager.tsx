import React, { useEffect, useRef, useState } from 'react';
import { AppView } from '../Header';

interface TrackpadGestureManagerProps {
  currentView: AppView;
  allowedViews: AppView[];
  onViewChange: (view: AppView) => void;
}

const VIEW_LABELS: Record<AppView, string> = {
  smart_booking: '📅 Smart Booking',
  emr: '📋 Bệnh Án EMR',
  smart_clinic_hardware: '🔬 VISIA & Máy',
  crm_automation: '🤖 CRM & ZNS',
  dashboard: '🎁 Promotions',
  services: '💆‍♀️ Dịch Vụ & Liệu Trình',
  inventory: '📦 Kho & Vật Tư',
  hr: '👥 Nhân Sự & Lương',
  users: '⚙️ Phân Quyền & Users',
};

/**
 * TrackpadGestureManager
 * - Provides 120Hz native trackpad intelligence across the application:
 *   1. Converts vertical/diagonal wheel gestures on horizontal tab strips into smooth horizontal panning.
 *   2. Prevents nested vertical scroll traps by handing off boundary wheel deltas to the main window.
 *   3. Protects horizontal 2-finger panning on wide tables from triggering accidental browser Back/Forward history navigation.
 *   4. Supports 2-finger horizontal trackpad swipe on non-scrollable canvas areas (or Alt + Left/Right) to switch modules smoothly.
 *   5. Enables click-and-drag kinetic horizontal scrolling on wide data tables (.overflow-x-auto).
 */
const TrackpadGestureManager: React.FC<TrackpadGestureManagerProps> = ({
  currentView,
  allowedViews,
  onViewChange,
}) => {
  const [gestureIndicator, setGestureIndicator] = useState<{
    direction: 'prev' | 'next';
    targetLabel: string;
  } | null>(null);

  const swipeAccumXRef = useRef<number>(0);
  const lastSwipeTimeRef = useRef<number>(0);
  const swipeResetTimerRef = useRef<number | null>(null);
  const indicatorTimerRef = useRef<number | null>(null);

  // Keep latest props in ref for native event listeners
  const stateRef = useRef({ currentView, allowedViews, onViewChange });
  useEffect(() => {
    stateRef.current = { currentView, allowedViews, onViewChange };
  }, [currentView, allowedViews, onViewChange]);

  useEffect(() => {
    const showIndicator = (direction: 'prev' | 'next', targetView: AppView) => {
      setGestureIndicator({
        direction,
        targetLabel: VIEW_LABELS[targetView] || targetView,
      });
      if (indicatorTimerRef.current) {
        window.clearTimeout(indicatorTimerRef.current);
      }
      indicatorTimerRef.current = window.setTimeout(() => {
        setGestureIndicator(null);
      }, 950);
    };

    const navigateAdjacentView = (dir: 'prev' | 'next') => {
      const { currentView: cur, allowedViews: views, onViewChange: change } = stateRef.current;
      if (!views || views.length <= 1) return;
      const idx = views.indexOf(cur);
      if (idx === -1) return;

      const nextIdx = dir === 'next' ? idx + 1 : idx - 1;
      if (nextIdx >= 0 && nextIdx < views.length) {
        const target = views[nextIdx];
        change(target);
        showIndicator(dir, target);
      }
    };

    // Helper: Find closest scrollable ancestor
    const findScrollableAncestors = (target: EventTarget | null) => {
      let el = target instanceof HTMLElement ? target : null;
      let horizontalEl: HTMLElement | null = null;
      let verticalEl: HTMLElement | null = null;
      let insideModal = false;

      while (el && el !== document.body && el !== document.documentElement) {
        if (el.getAttribute('data-modal-root') === 'true' || el.classList.contains('fixed')) {
          insideModal = true;
        }

        const style = window.getComputedStyle(el);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;

        if (
          !horizontalEl &&
          (overflowX === 'auto' || overflowX === 'scroll' || el.hasAttribute('data-trackpad-tabs')) &&
          el.scrollWidth > el.clientWidth + 2
        ) {
          horizontalEl = el;
        }

        if (
          !verticalEl &&
          (overflowY === 'auto' || overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight + 2
        ) {
          verticalEl = el;
        }

        el = el.parentElement;
      }

      return { horizontalEl, verticalEl, insideModal };
    };

    const handleWheel = (e: WheelEvent) => {
      // Do not interfere with pinch-to-zoom (ctrlKey on trackpad)
      if (e.ctrlKey || e.metaKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const { horizontalEl, verticalEl, insideModal } = findScrollableAncestors(target);

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // CASE 1: Cursor is over a Horizontal Tab Bar ([data-trackpad-tabs] or compact nav strip)
      if (
        horizontalEl &&
        (horizontalEl.hasAttribute('data-trackpad-tabs') || horizontalEl.clientHeight <= 88) &&
        !verticalEl
      ) {
        // Convert vertical wheel or diagonal trackpad gesture into horizontal tab glide
        const primaryDelta = absX > absY ? e.deltaX : e.deltaY;
        if (Math.abs(primaryDelta) > 0) {
          const maxScrollLeft = horizontalEl.scrollWidth - horizontalEl.clientWidth;
          const canScrollLeft = horizontalEl.scrollLeft > 0 && primaryDelta < 0;
          const canScrollRight = horizontalEl.scrollLeft < maxScrollLeft - 1 && primaryDelta > 0;

          if (canScrollLeft || canScrollRight || absX > absY) {
            e.preventDefault();
            horizontalEl.scrollLeft += primaryDelta;
            return;
          }
        }
      }

      // CASE 2: Cursor is over a Horizontally Scrollable Table / Container (.overflow-x-auto)
      if (horizontalEl) {
        const maxScrollLeft = horizontalEl.scrollWidth - horizontalEl.clientWidth;

        // Shift + vertical wheel -> scroll horizontally
        if (e.shiftKey && absY > 0 && absX === 0) {
          e.preventDefault();
          horizontalEl.scrollLeft += e.deltaY;
          return;
        }

        // Two-finger horizontal swipe on trackpad
        if (absX > absY) {
          const atLeftEdge = horizontalEl.scrollLeft <= 0 && e.deltaX < 0;
          const atRightEdge = horizontalEl.scrollLeft >= maxScrollLeft - 1 && e.deltaX > 0;
          // Prevent browser Back/Forward history navigation when swiping horizontally on a table
          if (atLeftEdge || atRightEdge) {
            e.preventDefault();
          }
          return;
        }
      }

      // CASE 3: Nested Vertical Scroll Container Boundary Handoff (Zero Scroll-Trap)
      if (verticalEl && !insideModal && absY >= absX) {
        const atTop = verticalEl.scrollTop <= 0 && e.deltaY < 0;
        const atBottom =
          verticalEl.scrollTop + verticalEl.clientHeight >= verticalEl.scrollHeight - 2 &&
          e.deltaY > 0;

        if (atTop || atBottom) {
          // Hand off vertical trackpad momentum smoothly to the main window
          e.preventDefault();
          window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
          return;
        }
      }

      // CASE 4: Deliberate 2-Finger Horizontal Swipe on Non-Scrollable Canvas -> Switch Module
      const isInteractiveInput =
        target.closest('input, textarea, select, [contenteditable="true"]') !== null;

      if (!horizontalEl && !insideModal && !isInteractiveInput && absX > absY * 2.4 && absX > 14) {
        // Prevent browser back/forward overscroll navigation
        e.preventDefault();

        const now = Date.now();
        if (now - lastSwipeTimeRef.current < 750) {
          return; // Cooldown active so trackpad inertia doesn't jump multiple views
        }

        swipeAccumXRef.current += e.deltaX;

        if (swipeResetTimerRef.current) {
          window.clearTimeout(swipeResetTimerRef.current);
        }
        swipeResetTimerRef.current = window.setTimeout(() => {
          swipeAccumXRef.current = 0;
        }, 220);

        if (swipeAccumXRef.current > 115) {
          lastSwipeTimeRef.current = now;
          swipeAccumXRef.current = 0;
          navigateAdjacentView('next');
        } else if (swipeAccumXRef.current < -115) {
          lastSwipeTimeRef.current = now;
          swipeAccumXRef.current = 0;
          navigateAdjacentView('prev');
        }
      }
    };

    // Keyboard shortcut: Alt + ArrowLeft / ArrowRight to glide between modules
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigateAdjacentView('next');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateAdjacentView('prev');
        }
      }
    };

    // Kinetic Click-and-Drag Horizontal Scroll on wide .overflow-x-auto containers
    let dragEl: HTMLElement | null = null;
    let startX = 0;
    let startScrollLeft = 0;
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do not hijack clicks on interactive elements or text inputs
      if (
        target.closest(
          'button, a, input, select, textarea, label, [role="button"], .cursor-pointer'
        )
      ) {
        return;
      }

      const container = target.closest('.overflow-x-auto') as HTMLElement | null;
      if (!container || container.scrollWidth <= container.clientWidth + 4) return;

      dragEl = container;
      startX = e.pageX;
      startScrollLeft = container.scrollLeft;
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragEl) return;
      const dx = e.pageX - startX;
      if (!isDragging && Math.abs(dx) > 6) {
        isDragging = true;
        dragEl.style.cursor = 'grabbing';
        dragEl.style.userSelect = 'none';
      }
      if (isDragging) {
        e.preventDefault();
        dragEl.scrollLeft = startScrollLeft - dx * 1.15;
      }
    };

    const handleMouseUp = () => {
      if (dragEl) {
        dragEl.style.cursor = '';
        dragEl.style.userSelect = '';
        dragEl = null;
        isDragging = false;
      }
    };

    // Auto-center clicked tab inside any horizontal scroll container
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('button') as HTMLElement | null;
      if (!btn) return;
      const tabStrip = btn.closest('[data-trackpad-tabs], nav.overflow-x-auto, .overflow-x-auto') as HTMLElement | null;
      if (tabStrip && tabStrip.clientHeight <= 90 && tabStrip.scrollWidth > tabStrip.clientWidth) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      if (swipeResetTimerRef.current) window.clearTimeout(swipeResetTimerRef.current);
      if (indicatorTimerRef.current) window.clearTimeout(indicatorTimerRef.current);
    };
  }, []);

  if (!gestureIndicator) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-view-enter">
      <div className="bg-[#18181B]/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/15 flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
        <span className="text-[#E5989B]">
          {gestureIndicator.direction === 'prev' ? '← Lướt sang' : 'Lướt sang →'}
        </span>
        <span>{gestureIndicator.targetLabel}</span>
      </div>
    </div>
  );
};

export default TrackpadGestureManager;
