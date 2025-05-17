
// This file now serves as a bridge to simplify imports for consumers
// It re-exports from the actual implementation files

import {
  ToastProvider,
  ToastViewport,
  Toast, // Component
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast";

import { useToast, toast, type ToasterToast } from "@/hooks/use-toast";

// Re-export everything
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
  toast,
  type ToastActionElement,
  type ToastProps,
  type ToasterToast,
};
