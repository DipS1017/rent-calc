<script>
  let { onclick, busy = false } = $props()
</script>

<button
  {onclick}
  disabled={busy}
  class="btn w-full min-w-[248px] border border-slate-200 bg-white text-[15px] text-slate-700 shadow-[var(--shadow-soft)] hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
>
  {#if busy}
    <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500"></span>
    Opening…
  {:else}
    <svg viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.7 13.4-4.7l-6.2-5.2C29.2 36.3 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-6.9l-6.6 5.1C9 40.4 16 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.1l6.2 5.2C41.9 35.2 45 30 45 24c0-1.4-.1-2.5-.4-3.5z"/>
    </svg>
    Sign in with Google
  {/if}
</button>
