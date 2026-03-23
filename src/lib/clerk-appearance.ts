export const clerkAppearance = {
  elements: {
    card: "bg-transparent shadow-none border-0",
    headerTitle: "text-white",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-black/30 text-white hover:bg-white/10",
    formButtonPrimary: "bg-white text-black hover:bg-zinc-200",
    formFieldInput: "bg-black/30 border border-white/10 text-white",
    formFieldLabel: "text-zinc-300",
    footerActionLink: "text-cyan-300 hover:text-cyan-200",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-cyan-300 hover:text-cyan-200",
    formResendCodeLink: "text-cyan-300 hover:text-cyan-200",
    alertText: "text-rose-200",
    alert: "border border-rose-500/30 bg-rose-500/10",
    dividerLine: "bg-white/10",
    dividerText: "text-zinc-500",
    userButtonPopoverCard: "bg-zinc-950 border border-white/10 shadow-2xl",
    userButtonPopoverActionButton: "text-zinc-200 hover:bg-white/10",
    userButtonPopoverActionButtonText: "text-zinc-200",
    userButtonPopoverFooter: "hidden",
  },
} as const;
